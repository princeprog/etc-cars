"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  CopyIcon,
  GripVerticalIcon,
  ListPlusIcon,
  PlusIcon,
  RotateCcwIcon,
  SaveIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "@/components/ui/sileo";

import { AuthenticatedAppShell } from "@/components/app-shell/authenticated-app-shell";
import { ApiErrorAlert } from "@/components/operations/api-error-alert";
import { EmptyState } from "@/components/operations/empty-state";
import { ModuleLoadingState } from "@/components/operations/module-loading-state";
import { SubmitButton } from "@/components/operations/submit-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUpdateInspectionChecklistSettingsMutation } from "@/hooks/mutations/inspection-checklists/use-inspection-checklists-mutations";
import { useAuthenticatedUserQuery } from "@/hooks/queries/auth/use-authenticated-user-query";
import { can } from "@/lib/permissions";
import { useInspectionChecklistSettingsQuery } from "@/hooks/queries/inspection-checklists/use-inspection-checklists-query";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/types/api";
import type {
  InspectionChecklistSettings,
  InspectionTemplateItem,
  InspectionTemplateSection,
} from "@/types/inspection-checklists";

const FINDING_KEYS = [
  { value: "", label: "No summary" },
  { value: "engine", label: "Engine" },
  { value: "transmission", label: "Transmission" },
  { value: "suspension", label: "Suspension" },
  { value: "brakes", label: "Brakes" },
  { value: "tires", label: "Tires" },
  { value: "exterior", label: "Exterior" },
  { value: "interior", label: "Interior" },
  { value: "ac", label: "AC" },
  { value: "electrical", label: "Electrical" },
  { value: "papers", label: "Papers" },
];
const EXIT_ANIMATION_MS = 180;

type SectionDeleteTarget = {
  key: string;
  label: string;
  itemCount: number;
};

type PendingNavigation =
  | {
      type: "href";
      href: string;
    }
  | {
      type: "back";
    };

function createStableKey(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createItem(index: number): InspectionTemplateItem {
  return {
    label: "Checklist item",
    stableKey: createStableKey("item"),
    findingKey: null,
    isRequired: true,
    isActive: true,
    sortOrder: index,
  };
}

function createSection(index: number): InspectionTemplateSection {
  return {
    id: createStableKey("section"),
    label: `Section ${index + 1}`,
    isActive: true,
    sortOrder: index,
    items: [createItem(0)],
  };
}

function sortStructure(sections: InspectionTemplateSection[]) {
  return sections.map((section, sectionIndex) => ({
    ...section,
    sortOrder: sectionIndex,
    items: section.items.map((item, itemIndex) => ({
      ...item,
      sortOrder: itemIndex,
    })),
  }));
}

function getSectionKey(section: InspectionTemplateSection, index: number) {
  return section.id ?? `${section.label}-${index}`;
}

function getItemKey(item: InspectionTemplateItem, index: number) {
  return item.id ?? item.stableKey ?? `${item.label}-${index}`;
}

function getValidationMessage(sections: InspectionTemplateSection[]) {
  const activeSections = sections.filter((section) => section.isActive);
  const activeItems = activeSections.flatMap((section) =>
    section.items.filter((item) => item.isActive),
  );

  if (sections.length === 0) return "Add at least one checklist section.";
  if (sections.some((section) => !section.label.trim())) {
    return "Every section needs a name.";
  }
  if (
    sections.some((section) => section.items.some((item) => !item.label.trim()))
  ) {
    return "Every checklist item needs a label.";
  }
  if (activeSections.length === 0 || activeItems.length === 0) {
    return "Keep at least one active section with one active item.";
  }
  return null;
}

export function InspectionChecklistsScreen() {
  return (
    <AuthenticatedAppShell
      title="Inspection Checklist"
      breadcrumbs={[
        { label: "Settings", href: "/settings" },
        { label: "Inspection Checklist" },
      ]}
    >
      <InspectionChecklistsContent />
    </AuthenticatedAppShell>
  );
}

function InspectionChecklistsContent() {
  const authQuery = useAuthenticatedUserQuery();
  const settingsQuery = useInspectionChecklistSettingsQuery();

  if (!can(authQuery.data?.user, "inspection_checklists.manage")) {
    return (
      <div className="flex flex-1 items-start px-4 py-6 md:px-6">
        <Alert variant="destructive" className="max-w-xl">
          <ListPlusIcon />
          <AlertTitle>Admin access required</AlertTitle>
          <AlertDescription>
            Inspection checklist settings are available only to admin users.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-5 px-4 py-6 md:px-8">
      {settingsQuery.isPending ? (
        <ModuleLoadingState label="Loading inspection checklist settings" />
      ) : settingsQuery.error ? (
        <ApiErrorAlert
          title="Unable to load inspection checklist"
          message={getApiErrorMessage(settingsQuery.error, "")}
        />
      ) : settingsQuery.data ? (
        <ChecklistEditor
          key={`${settingsQuery.data.revision}-${settingsQuery.data.updatedAt}`}
          settings={settingsQuery.data}
        />
      ) : (
        <EmptyState
          title="Inspection checklist unavailable"
          description="The checklist settings could not be loaded."
        />
      )}
    </main>
  );
}

function ChecklistEditor({
  settings,
}: {
  settings: InspectionChecklistSettings;
}) {
  const router = useRouter();
  const updateMutation = useUpdateInspectionChecklistSettingsMutation();
  const [sections, setSections] = React.useState(() =>
    settings.sections.length
      ? sortStructure(settings.sections)
      : [createSection(0)],
  );
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [savedSnapshot, setSavedSnapshot] = React.useState(() =>
    JSON.stringify(sortStructure(settings.sections)),
  );
  const [revision, setRevision] = React.useState(settings.revision);
  const [updatedAt, setUpdatedAt] = React.useState(settings.updatedAt);
  const [updatedBy, setUpdatedBy] = React.useState(settings.updatedBy);
  const [exitingSectionKeys, setExitingSectionKeys] = React.useState<
    Set<string>
  >(() => new Set());
  const [sectionDeleteTarget, setSectionDeleteTarget] =
    React.useState<SectionDeleteTarget | null>(null);
  const [pendingNavigation, setPendingNavigation] =
    React.useState<PendingNavigation | null>(null);
  const navigationBypassRef = React.useRef(false);
  const historyGuardArmedRef = React.useRef(false);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const normalizedSections = React.useMemo(
    () => sortStructure(sections),
    [sections],
  );
  const activeSection =
    normalizedSections[selectedIndex] ?? normalizedSections[0];
  const activeSectionCount = normalizedSections.filter(
    (section) => section.isActive,
  ).length;
  const activeItemCount = normalizedSections
    .flatMap((section) => section.items)
    .filter((item) => item.isActive).length;
  const dirty = JSON.stringify(normalizedSections) !== savedSnapshot;
  const validationMessage = getValidationMessage(normalizedSections);

  React.useEffect(() => {
    function warnBeforeUnload(event: BeforeUnloadEvent) {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [dirty]);

  React.useEffect(() => {
    if (!dirty) return;

    function handleDocumentClick(event: MouseEvent) {
      if (
        navigationBypassRef.current ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.download) return;
      if (anchor.target && anchor.target !== "_self") return;

      const nextUrl = new URL(anchor.href);
      const currentUrl = new URL(window.location.href);
      if (nextUrl.href === currentUrl.href) return;

      event.preventDefault();
      event.stopPropagation();
      setPendingNavigation({ type: "href", href: nextUrl.href });
    }

    document.addEventListener("click", handleDocumentClick, true);
    return () =>
      document.removeEventListener("click", handleDocumentClick, true);
  }, [dirty]);

  React.useEffect(() => {
    if (!dirty) {
      historyGuardArmedRef.current = false;
      return;
    }

    if (!historyGuardArmedRef.current) {
      window.history.pushState(
        { inspectionChecklistUnsavedGuard: true },
        "",
        window.location.href,
      );
      historyGuardArmedRef.current = true;
    }

    function handlePopState() {
      if (navigationBypassRef.current) return;
      setPendingNavigation({ type: "back" });
      window.history.pushState(
        { inspectionChecklistUnsavedGuard: true },
        "",
        window.location.href,
      );
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [dirty]);

  function replaceSections(next: InspectionTemplateSection[]) {
    const sorted = sortStructure(next);
    setSections(sorted);
    setSelectedIndex((current) =>
      Math.min(current, Math.max(sorted.length - 1, 0)),
    );
  }

  function updateSelectedSection(next: InspectionTemplateSection) {
    replaceSections(
      normalizedSections.map((section, index) =>
        index === selectedIndex ? next : section,
      ),
    );
  }

  function handleSectionDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = normalizedSections.findIndex(
      (section, index) => getSectionKey(section, index) === active.id,
    );
    const newIndex = normalizedSections.findIndex(
      (section, index) => getSectionKey(section, index) === over.id,
    );
    const next = sortStructure(
      arrayMove(normalizedSections, oldIndex, newIndex),
    );
    setSections(next);
    setSelectedIndex(newIndex);
  }

  function requestSelectedSectionDelete() {
    const section = normalizedSections[selectedIndex];
    if (!section || normalizedSections.length === 1) return;

    setSectionDeleteTarget({
      key: getSectionKey(section, selectedIndex),
      label: section.label || "Untitled section",
      itemCount: section.items.length,
    });
  }

  function confirmSectionDelete() {
    if (!sectionDeleteTarget) return;
    const sectionKey = sectionDeleteTarget.key;
    setExitingSectionKeys((current) => new Set(current).add(sectionKey));
    setSectionDeleteTarget(null);
    window.setTimeout(() => {
      replaceSections(
        normalizedSections.filter(
          (currentSection, index) =>
            getSectionKey(currentSection, index) !== sectionKey,
        ),
      );
      setExitingSectionKeys((current) => {
        const next = new Set(current);
        next.delete(sectionKey);
        return next;
      });
    }, EXIT_ANIMATION_MS);
  }

  async function saveChanges() {
    if (validationMessage) return;
    const result = await updateMutation.mutateAsync({
      expectedRevision: revision,
      sections: normalizedSections,
    });
    setSections(sortStructure(result.sections));
    setSavedSnapshot(JSON.stringify(sortStructure(result.sections)));
    setRevision(result.revision);
    setUpdatedAt(result.updatedAt);
    setUpdatedBy(result.updatedBy);
    toast.success("Inspection checklist saved");
  }

  function confirmPendingNavigation() {
    if (!pendingNavigation) return;
    navigationBypassRef.current = true;

    if (pendingNavigation.type === "back") {
      window.history.go(-2);
      return;
    }

    const nextUrl = new URL(pendingNavigation.href);
    if (nextUrl.origin === window.location.origin) {
      router.push(`${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
      return;
    }

    window.location.assign(nextUrl.href);
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-5">
        <header className="sticky top-0 z-10 flex flex-col gap-4 border-b bg-background/95 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/85 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-normal">
                Vehicle Inspection Checklist
              </h1>
              {dirty ? <Badge variant="outline">Unsaved</Badge> : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Revision {revision} · {activeSectionCount} active sections ·{" "}
              {activeItemCount} active items · Updated{" "}
              {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
              {updatedBy?.fullName ? ` by ${updatedBy.fullName}` : ""}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button type="button" variant="outline" asChild>
              <Link href="/settings">
                <ArrowLeftIcon data-icon="inline-start" />
                Back
              </Link>
            </Button>
            <SubmitButton
              type="button"
              pending={updateMutation.isPending}
              pendingLabel="Saving"
              disabled={!dirty || Boolean(validationMessage)}
              onClick={() => void saveChanges()}
            >
              <SaveIcon data-icon="inline-start" />
              Save changes
            </SubmitButton>
          </div>
        </header>

        {settings.affectedDraftInspectionCount > 0 ? (
          <Alert>
            <RotateCcwIcon />
            <AlertTitle>Draft inspections will update</AlertTitle>
            <AlertDescription>
              Saving changes will update {settings.affectedDraftInspectionCount}{" "}
              in-progress inspection
              {settings.affectedDraftInspectionCount === 1 ? "" : "s"}.
              Completed inspections stay unchanged.
            </AlertDescription>
          </Alert>
        ) : null}

        {updateMutation.error ? (
          <ApiErrorAlert
            title="Unable to save checklist"
            message={getApiErrorMessage(updateMutation.error, "")}
          />
        ) : null}

        {validationMessage ? (
          <Alert variant="destructive">
            <ListPlusIcon />
            <AlertTitle>Checklist needs attention</AlertTitle>
            <AlertDescription>{validationMessage}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid min-h-[34rem] gap-4 xl:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="flex min-w-0 flex-col gap-3 rounded-lg border bg-card p-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Sections</h2>
              <IconButton
                label="Add section"
                onClick={() => {
                  const next = [
                    ...normalizedSections,
                    createSection(normalizedSections.length),
                  ];
                  replaceSections(next);
                  setSelectedIndex(next.length - 1);
                }}
              >
                <PlusIcon />
              </IconButton>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleSectionDragEnd}
            >
              <SortableContext
                items={normalizedSections.map(getSectionKey)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-2">
                  {normalizedSections.map((section, index) => (
                    <SortableSectionButton
                      key={getSectionKey(section, index)}
                      id={getSectionKey(section, index)}
                      section={section}
                      selected={index === selectedIndex}
                      exiting={exitingSectionKeys.has(
                        getSectionKey(section, index),
                      )}
                      onSelect={() => setSelectedIndex(index)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </aside>

          <section className="min-w-0 rounded-lg border bg-card">
            {activeSection ? (
              <SectionEditor
                section={activeSection}
                sectionIndex={selectedIndex}
                totalSections={normalizedSections.length}
                onChange={updateSelectedSection}
                onDuplicate={() => {
                  const duplicate = {
                    ...activeSection,
                    id: createStableKey("section-copy"),
                    label: `${activeSection.label} copy`,
                    items: activeSection.items.map((item, index) => ({
                      ...item,
                      id: undefined,
                      stableKey: createStableKey(`copy-${index}`),
                    })),
                  };
                  replaceSections([
                    ...normalizedSections.slice(0, selectedIndex + 1),
                    duplicate,
                    ...normalizedSections.slice(selectedIndex + 1),
                  ]);
                  setSelectedIndex(selectedIndex + 1);
                }}
                onDelete={requestSelectedSectionDelete}
                onMove={(direction) => {
                  const target = selectedIndex + direction;
                  if (target < 0 || target >= normalizedSections.length) return;
                  replaceSections(
                    arrayMove(normalizedSections, selectedIndex, target),
                  );
                  setSelectedIndex(target);
                }}
              />
            ) : (
              <EmptyState title="No section selected" description="" />
            )}
          </section>
        </div>
        <DeleteSectionDialog
          target={sectionDeleteTarget}
          onOpenChange={(open) => {
            if (!open) setSectionDeleteTarget(null);
          }}
          onConfirm={confirmSectionDelete}
        />
        <UnsavedChangesDialog
          open={Boolean(pendingNavigation)}
          onOpenChange={(open) => {
            if (!open) setPendingNavigation(null);
          }}
          onConfirm={confirmPendingNavigation}
        />
      </div>
    </TooltipProvider>
  );
}

function UnsavedChangesDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-300">
            <SaveIcon />
          </AlertDialogMedia>
          <AlertDialogTitle>Leave without saving?</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved inspection checklist changes. Continue editing to
            review or save them, or leave this page and discard the unsaved
            changes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Continue editing</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Leave without saving
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DeleteSectionDialog({
  target,
  onOpenChange,
  onConfirm,
}: {
  target: SectionDeleteTarget | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={Boolean(target)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="rounded-full bg-destructive/10 text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete this section?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove{" "}
            <span className="font-medium text-foreground">
              {target?.label ?? "this section"}
            </span>{" "}
            and {target?.itemCount ?? 0} checklist item
            {target?.itemCount === 1 ? "" : "s"} from the inspection checklist.
            The change will only affect inspections after you save.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Delete section
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function SortableSectionButton({
  id,
  section,
  selected,
  onSelect,
  exiting,
}: {
  id: string;
  section: InspectionTemplateSection;
  selected: boolean;
  onSelect: () => void;
  exiting: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id,
    });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const activeItems = section.items.filter((item) => item.isActive).length;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "checklist-motion-enter flex min-w-0 items-stretch gap-1",
        exiting && "checklist-motion-exit",
      )}
    >
      <IconButton
        label={`Reorder ${section.label}`}
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon />
      </IconButton>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "checklist-motion-surface flex min-w-0 flex-1 flex-col rounded-md border px-3 py-2 text-left text-sm",
          selected ? "border-primary bg-primary/10" : "hover:bg-muted",
          !section.isActive && "opacity-60",
        )}
      >
        <span className="truncate font-medium">
          {section.label || "Untitled section"}
        </span>
        <span className="text-xs text-muted-foreground">
          {activeItems} active item{activeItems === 1 ? "" : "s"}
        </span>
      </button>
    </div>
  );
}

function SectionEditor({
  section,
  sectionIndex,
  totalSections,
  onChange,
  onDuplicate,
  onDelete,
  onMove,
}: {
  section: InspectionTemplateSection;
  sectionIndex: number;
  totalSections: number;
  onChange: (section: InspectionTemplateSection) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMove: (direction: -1 | 1) => void;
}) {
  const [exitingItemKeys, setExitingItemKeys] = React.useState<Set<string>>(
    () => new Set(),
  );
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function replaceItems(items: InspectionTemplateItem[]) {
    onChange({
      ...section,
      items: items.map((item, index) => ({ ...item, sortOrder: index })),
    });
  }

  function handleItemDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = section.items.findIndex(
      (item, index) => getItemKey(item, index) === active.id,
    );
    const newIndex = section.items.findIndex(
      (item, index) => getItemKey(item, index) === over.id,
    );
    replaceItems(arrayMove(section.items, oldIndex, newIndex));
  }

  function removeItem(item: InspectionTemplateItem, index: number) {
    if (section.items.length === 1) return;
    const itemKey = getItemKey(item, index);
    setExitingItemKeys((current) => new Set(current).add(itemKey));
    window.setTimeout(() => {
      replaceItems(
        section.items.filter(
          (currentItem, currentIndex) =>
            getItemKey(currentItem, currentIndex) !== itemKey,
        ),
      );
      setExitingItemKeys((current) => {
        const next = new Set(current);
        next.delete(itemKey);
        return next;
      });
    }, EXIT_ANIMATION_MS);
  }

  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex flex-col gap-4 border-b p-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="flex min-w-0 flex-col gap-1.5">
            <Label htmlFor="section-label">Section name</Label>
            <Input
              id="section-label"
              value={section.label}
              onChange={(event) =>
                onChange({ ...section, label: event.target.value })
              }
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium">
            <Switch
              checked={section.isActive}
              onCheckedChange={(checked) =>
                onChange({ ...section, isActive: Boolean(checked) })
              }
            />
            Active
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <IconButton
            label="Move section up"
            disabled={sectionIndex === 0}
            onClick={() => onMove(-1)}
          >
            <ArrowUpIcon />
          </IconButton>
          <IconButton
            label="Move section down"
            disabled={sectionIndex === totalSections - 1}
            onClick={() => onMove(1)}
          >
            <ArrowDownIcon />
          </IconButton>
          <IconButton label="Duplicate section" onClick={onDuplicate}>
            <CopyIcon />
          </IconButton>
          <IconButton
            label="Delete section"
            disabled={totalSections === 1}
            onClick={onDelete}
          >
            <Trash2Icon />
          </IconButton>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="hidden grid-cols-[2.25rem_minmax(12rem,1fr)_minmax(9rem,11rem)_7rem_6.5rem_10.5rem] gap-3 px-3 text-xs font-medium text-muted-foreground 2xl:grid">
          <span />
          <span>Item</span>
          <span>Summary</span>
          <span>Required</span>
          <span>Active</span>
          <span />
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleItemDragEnd}
        >
          <SortableContext
            items={section.items.map(getItemKey)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {section.items.map((item, index) => (
                <SortableItemRow
                  key={getItemKey(item, index)}
                  id={getItemKey(item, index)}
                  item={item}
                  index={index}
                  totalItems={section.items.length}
                  exiting={exitingItemKeys.has(getItemKey(item, index))}
                  onChange={(next) =>
                    replaceItems(
                      section.items.map((current, currentIndex) =>
                        currentIndex === index ? next : current,
                      ),
                    )
                  }
                  onDelete={() => {
                    removeItem(item, index);
                  }}
                  onDuplicate={() =>
                    replaceItems([
                      ...section.items.slice(0, index + 1),
                      {
                        ...item,
                        id: undefined,
                        label: `${item.label} copy`,
                        stableKey: createStableKey("item-copy"),
                      },
                      ...section.items.slice(index + 1),
                    ])
                  }
                  onMove={(direction) => {
                    const target = index + direction;
                    if (target < 0 || target >= section.items.length) return;
                    replaceItems(arrayMove(section.items, index, target));
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <Button
          type="button"
          variant="outline"
          className="w-fit"
          onClick={() =>
            replaceItems([...section.items, createItem(section.items.length)])
          }
        >
          <PlusIcon data-icon="inline-start" />
          Add item
        </Button>
      </div>
    </div>
  );
}

function SortableItemRow({
  id,
  item,
  index,
  totalItems,
  onChange,
  onDelete,
  onDuplicate,
  onMove,
  exiting,
}: {
  id: string;
  item: InspectionTemplateItem;
  index: number;
  totalItems: number;
  onChange: (item: InspectionTemplateItem) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMove: (direction: -1 | 1) => void;
  exiting: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id,
    });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "checklist-motion-enter checklist-motion-surface grid min-w-0 gap-3 rounded-md border bg-background p-3 md:grid-cols-[2.25rem_minmax(0,1fr)] md:items-start 2xl:grid-cols-[2.25rem_minmax(12rem,1fr)_minmax(9rem,11rem)_7rem_6.5rem_10.5rem] 2xl:items-center",
        !item.isActive && "opacity-65",
        exiting && "checklist-motion-exit",
      )}
    >
      <IconButton
        label={`Reorder ${item.label}`}
        className="self-start 2xl:self-center"
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon />
      </IconButton>
      <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(12rem,1fr)_minmax(9rem,12rem)_auto_auto_auto] md:items-end 2xl:contents">
        <div className="flex min-w-0 flex-col gap-1.5">
          <Label className="2xl:hidden">Item</Label>
          <Input
            value={item.label}
            onChange={(event) =>
              onChange({ ...item, label: event.target.value })
            }
            aria-label="Checklist item label"
          />
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <Label className="2xl:hidden">Summary</Label>
          <NativeSelect
            className="w-full"
            value={item.findingKey ?? ""}
            onChange={(event) =>
              onChange({ ...item, findingKey: event.target.value || null })
            }
            aria-label="Finding summary category"
          >
            {FINDING_KEYS.map((option) => (
              <option key={option.value || "none"} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </div>
        <label className="flex min-h-9 items-center gap-2 whitespace-nowrap text-sm 2xl:justify-start">
          <Checkbox
            checked={item.isRequired}
            onCheckedChange={(checked) =>
              onChange({ ...item, isRequired: Boolean(checked) })
            }
          />
          Required
        </label>
        <label className="flex min-h-9 items-center gap-2 whitespace-nowrap text-sm 2xl:justify-start">
          <Switch
            checked={item.isActive}
            onCheckedChange={(checked) =>
              onChange({ ...item, isActive: Boolean(checked) })
            }
          />
          Active
        </label>
        <div className="grid grid-cols-4 gap-1 justify-self-start md:justify-self-end 2xl:justify-self-end">
          <IconButton
            label="Move item up"
            disabled={index === 0}
            onClick={() => onMove(-1)}
          >
            <ArrowUpIcon />
          </IconButton>
          <IconButton
            label="Move item down"
            disabled={index === totalItems - 1}
            onClick={() => onMove(1)}
          >
            <ArrowDownIcon />
          </IconButton>
          <IconButton label="Duplicate item" onClick={onDuplicate}>
            <CopyIcon />
          </IconButton>
          <IconButton
            label="Delete item"
            disabled={totalItems === 1}
            onClick={onDelete}
          >
            <Trash2Icon />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

function IconButton({
  label,
  children,
  ...props
}: React.ComponentProps<typeof Button> & {
  label: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          {...props}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
