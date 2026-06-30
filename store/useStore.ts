import { create } from "zustand";
import { v4 as uuid } from "uuid";
import type {
  ActivityItem,
  AuthUser,
  CaseStudyTemplate,
  Contact,
  FileMetadata,
  JourneyStage,
  NavigationMap,
  Project,
  ProjectBrief,
  InterviewQuestion,
  Persona,
  PhaseId,
  Priority,
  ProjectStatus,
  PromptEntry,
  PromptImage,
  QuickNote,
  SitemapNode,
  TestingFinding,
} from "@/types";
import {
  bgSyncProject,
  bgSyncContact,
  bgSyncNote,
  bgDeleteProject,
  bgDeleteContact,
  bgDeleteNote,
  bgLogActivity,
  bgSyncPrompt,
  bgDeletePrompt,
} from "@/lib/supabase/sync";

interface StoreState {
  projects: Project[];
  contacts: Contact[];
  activity: ActivityItem[];
  quickNotes: QuickNote[];
  promptEntries: PromptEntry[];

  // ---- PHASE 3: auth + hydration ----
  currentUser: AuthUser | null;
  setCurrentUser: (user: AuthUser | null) => void;

  isHydrated: boolean;
  hydrateFromDB: (data: {
    projects: Project[];
    contacts: Contact[];
    quickNotes: QuickNote[];
    activity: ActivityItem[];
    promptEntries?: PromptEntry[];
  }) => void;

  addProject: (data: { name: string; client: string; category: string; priority: Priority }) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => Promise<void>;
  getProject: (id: string) => Project | undefined;

  updateBrief: (projectId: string, brief: Partial<ProjectBrief>) => void;

  addQuestion: (projectId: string, question: string, category: InterviewQuestion["category"]) => void;
  updateQuestion: (projectId: string, questionId: string, updates: Partial<InterviewQuestion>) => void;
  deleteQuestion: (projectId: string, questionId: string) => void;

  addPersona: (projectId: string, persona: Omit<Persona, "id" | "createdAt">) => void;
  updatePersona: (projectId: string, personaId: string, updates: Partial<Persona>) => void;
  deletePersona: (projectId: string, personaId: string) => void;

  markPhaseComplete: (projectId: string, phaseId: PhaseId) => void;
  setCurrentPhase: (projectId: string, phaseId: PhaseId) => void;

  updatePhaseNote: (projectId: string, phaseId: PhaseId, content: string) => void;
  updateHandoffNotes: (projectId: string, notes: string) => void;

  saveCaseStudy: (projectId: string, caseStudy: string) => void;
  updateCaseStudy: (projectId: string, content: string) => void;

  addContact: (data: Omit<Contact, "id" | "createdAt">) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;

  addActivity: (item: Omit<ActivityItem, "id" | "timestamp">) => void;

  updateSitemap: (projectId: string, sitemap: SitemapNode) => void;
  updateIANotes: (projectId: string, notes: string) => void;

  addJourneyStage: (projectId: string, stage: Omit<JourneyStage, "id">) => void;
  updateJourneyStage: (projectId: string, stageId: string, updates: Partial<JourneyStage>) => void;
  deleteJourneyStage: (projectId: string, stageId: string) => void;
  moveJourneyStage: (projectId: string, stageId: string, direction: "up" | "down") => void;

  addWireframeFile: (projectId: string, file: Omit<FileMetadata, "uploadedAt">) => FileMetadata;
  deleteWireframeFile: (projectId: string, fileId: string) => void;
  updateWireframeFile: (projectId: string, fileId: string, updates: Partial<FileMetadata>) => void;
  addUIScreenFile: (projectId: string, file: Omit<FileMetadata, "uploadedAt">) => FileMetadata;
  deleteUIScreenFile: (projectId: string, fileId: string) => void;
  updateUIScreenFile: (projectId: string, fileId: string, updates: Partial<FileMetadata>) => void;

  updatePrototype: (projectId: string, data: { prototypeLink?: string; prototypeNotes?: string }) => void;
  updateUIDesignNotes: (projectId: string, notes: string) => void;

  addFinding: (projectId: string, finding: Omit<TestingFinding, "id" | "createdAt">) => void;
  updateFinding: (projectId: string, findingId: string, updates: Partial<TestingFinding>) => void;
  deleteFinding: (projectId: string, findingId: string) => void;

  editProject: (
    id: string,
    data: { name: string; client: string; category: string; priority: Priority; status: ProjectStatus }
  ) => void;
  deleteProjectFull: (id: string) => Promise<void>;

  addQuickNote: (content: string, projectId?: string) => void;
  updateQuickNote: (id: string, content: string) => void;
  deleteQuickNote: (id: string) => void;

  // ---- PHASE 3: navigation map, templates, portfolio, archive, storage URLs ----
  updateNavMap: (projectId: string, map: NavigationMap) => void;
  setCaseStudyTemplate: (projectId: string, template: CaseStudyTemplate) => void;
  setPortfolioPublic: (projectId: string, isPublic: boolean, slug: string | null) => void;
  archiveProject: (projectId: string) => void;
  unarchiveProject: (projectId: string) => void;
  setWireframeFileUrl: (projectId: string, fileId: string, url: string) => void;
  setUIScreenFileUrl: (projectId: string, fileId: string, url: string) => void;

  // ---- PROMPT VAULT ----
  addPromptEntry: (data: Omit<PromptEntry, "id" | "createdAt" | "updatedAt">) => PromptEntry;
  updatePromptEntry: (id: string, updates: Partial<PromptEntry>) => void;
  deletePromptEntry: (id: string) => void;
  togglePromptFavorite: (id: string) => void;
  addPromptImage: (entryId: string, image: Omit<PromptImage, "uploadedAt">) => PromptImage;
  deletePromptImage: (entryId: string, imageId: string) => void;
}

const EMPTY_BRIEF: ProjectBrief = {
  problem: "",
  goal: "",
  targetUsers: "",
  constraints: "",
  successMetrics: "",
  businessContext: "",
};

function withDefaults(project: Project): Project {
  return {
    ...project,
    sitemap: project.sitemap ?? null,
    journeyStages: project.journeyStages ?? [],
    testingFindings: project.testingFindings ?? [],
    wireframeFiles: project.wireframeFiles ?? [],
    uiScreenFiles: project.uiScreenFiles ?? [],
    prototypeLink: project.prototypeLink ?? "",
    prototypeNotes: project.prototypeNotes ?? "",
    uiDesignNotes: project.uiDesignNotes ?? "",
    iaNotes: project.iaNotes ?? "",
    // Phase 3 defaults
    caseStudyTemplate: project.caseStudyTemplate ?? "web",
    navMap: project.navMap ?? { nodes: [], edges: [] },
    isArchived: project.isArchived ?? false,
    isPortfolioPublic: project.isPortfolioPublic ?? false,
    portfolioSlug: project.portfolioSlug ?? null,
  };
}

export const useStore = create<StoreState>()((set, get) => {
  // Fire-and-forget: push the current state of a project to Supabase.
  const syncById = (projectId: string) => {
    const updated = get().getProject(projectId);
    if (updated) bgSyncProject(updated);
  };

  return {
    projects: [],
    contacts: [],
    activity: [],
    quickNotes: [],
    promptEntries: [],

    currentUser: null,
    setCurrentUser: (user) => set({ currentUser: user }),

    isHydrated: false,
    hydrateFromDB: ({ projects, contacts, quickNotes, activity, promptEntries }) => {
      set({
        projects: projects.map(withDefaults),
        contacts,
        quickNotes,
        activity,
        promptEntries: promptEntries ?? [],
        isHydrated: true,
      });
    },

    addProject: (data) => {
      const now = new Date().toISOString();
      const project: Project = {
        id: uuid(),
        name: data.name,
        client: data.client,
        category: data.category,
        status: "In Progress",
        priority: data.priority,
        currentPhase: 1,
        completedPhases: [],
        brief: { ...EMPTY_BRIEF },
        interviewQuestions: [],
        personas: [],
        phaseNotes: [],
        handoffNotes: "",
        sitemap: null,
        journeyStages: [],
        testingFindings: [],
        wireframeFiles: [],
        uiScreenFiles: [],
        prototypeLink: "",
        prototypeNotes: "",
        uiDesignNotes: "",
        iaNotes: "",
        caseStudy: null,
        caseStudyGeneratedAt: null,
        caseStudyTemplate: "web",
        navMap: { nodes: [], edges: [] },
        isArchived: false,
        isPortfolioPublic: false,
        portfolioSlug: null,
        daysActive: 0,
        createdAt: now,
        updatedAt: now,
      };
      set((state) => ({ projects: [...state.projects, project] }));
      bgSyncProject(project);
      get().addActivity({ text: `New project created: ${data.name}`, type: "project", projectId: project.id });
      return project;
    },

    updateProject: (id, updates) => {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === id ? withDefaults({ ...project, ...updates, updatedAt: new Date().toISOString() }) : project
        ),
      }));
      syncById(id);
    },

    deleteProject: async (id) => {
      const previousProjects = get().projects;
      set((state) => ({ projects: state.projects.filter((project) => project.id !== id) }));
      try {
        await bgDeleteProject(id);
      } catch (error) {
        set({ projects: previousProjects });
        throw error;
      }
    },

    getProject: (id) => {
      // Return the stored reference directly. Defaults are already applied when
      // projects enter the store (hydrateFromDB → withDefaults, addProject), so
      // re-wrapping here would create a new object every call and break the
      // referential stability useSyncExternalStore relies on (infinite loop).
      return get().projects.find((item) => item.id === id);
    },

    updateBrief: (projectId, brief) => {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId
            ? { ...project, brief: { ...project.brief, ...brief }, updatedAt: new Date().toISOString() }
            : project
        ),
      }));
      syncById(projectId);
    },

    addQuestion: (projectId, question, category) => {
      const item: InterviewQuestion = { id: uuid(), question, category, createdAt: new Date().toISOString() };
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId ? { ...project, interviewQuestions: [...project.interviewQuestions, item] } : project
        ),
      }));
      syncById(projectId);
    },

    updateQuestion: (projectId, questionId, updates) => {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                interviewQuestions: project.interviewQuestions.map((question) =>
                  question.id === questionId ? { ...question, ...updates } : question
                ),
              }
            : project
        ),
      }));
      syncById(projectId);
    },

    deleteQuestion: (projectId, questionId) => {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId
            ? { ...project, interviewQuestions: project.interviewQuestions.filter((question) => question.id !== questionId) }
            : project
        ),
      }));
      syncById(projectId);
    },

    addPersona: (projectId, personaData) => {
      const persona: Persona = { ...personaData, id: uuid(), createdAt: new Date().toISOString() };
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId ? { ...project, personas: [...project.personas, persona] } : project
        ),
      }));
      syncById(projectId);
    },

    updatePersona: (projectId, personaId, updates) => {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                personas: project.personas.map((persona) => (persona.id === personaId ? { ...persona, ...updates } : persona)),
              }
            : project
        ),
      }));
      syncById(projectId);
    },

    deletePersona: (projectId, personaId) => {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId ? { ...project, personas: project.personas.filter((persona) => persona.id !== personaId) } : project
        ),
      }));
      syncById(projectId);
    },

    markPhaseComplete: (projectId, phaseId) => {
      const project = get().getProject(projectId);
      if (!project) return;
      const completedPhases = project.completedPhases.includes(phaseId)
        ? project.completedPhases
        : [...project.completedPhases, phaseId];
      const nextPhase = Math.min(phaseId + 1, 9) as PhaseId;
      const status: ProjectStatus = completedPhases.length === 9 ? "Complete" : project.status;
      set((state) => ({
        projects: state.projects.map((item) =>
          item.id === projectId
            ? { ...item, completedPhases, currentPhase: nextPhase, status, updatedAt: new Date().toISOString() }
            : item
        ),
      }));
      syncById(projectId);
      get().addActivity({
        text: `Phase ${String(phaseId).padStart(2, "0")} marked complete`,
        type: "phase",
        projectId,
      });
    },

    setCurrentPhase: (projectId, phaseId) => {
      set((state) => ({
        projects: state.projects.map((project) => (project.id === projectId ? { ...project, currentPhase: phaseId } : project)),
      }));
    },

    updatePhaseNote: (projectId, phaseId, content) => {
      set((state) => ({
        projects: state.projects.map((project) => {
          if (project.id !== projectId) return project;
          const existing = project.phaseNotes.find((note) => note.phaseId === phaseId);
          const phaseNotes = existing
            ? project.phaseNotes.map((note) =>
                note.phaseId === phaseId ? { ...note, content, updatedAt: new Date().toISOString() } : note
              )
            : [...project.phaseNotes, { phaseId, content, updatedAt: new Date().toISOString() }];
          return { ...project, phaseNotes, updatedAt: new Date().toISOString() };
        }),
      }));
      syncById(projectId);
    },

    updateHandoffNotes: (projectId, notes) => {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId ? { ...project, handoffNotes: notes, updatedAt: new Date().toISOString() } : project
        ),
      }));
      syncById(projectId);
    },

    saveCaseStudy: (projectId, caseStudy) => {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                caseStudy,
                caseStudyGeneratedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : project
        ),
      }));
      syncById(projectId);
      get().addActivity({ text: "AI case study generated", type: "ai", projectId });
    },

    updateCaseStudy: (projectId, content) => {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId ? { ...project, caseStudy: content, updatedAt: new Date().toISOString() } : project
        ),
      }));
      syncById(projectId);
    },

    addContact: (data) => {
      const contact: Contact = { ...data, id: uuid(), createdAt: new Date().toISOString() };
      set((state) => ({ contacts: [...state.contacts, contact] }));
      bgSyncContact(contact);
    },

    updateContact: (id, updates) => {
      set((state) => ({ contacts: state.contacts.map((contact) => (contact.id === id ? { ...contact, ...updates } : contact)) }));
      const updated = get().contacts.find((c) => c.id === id);
      if (updated) bgSyncContact(updated);
    },

    deleteContact: (id) => {
      set((state) => ({ contacts: state.contacts.filter((contact) => contact.id !== id) }));
      bgDeleteContact(id);
    },

    addActivity: (item) => {
      const activityItem: ActivityItem = { ...item, id: uuid(), timestamp: new Date().toISOString() };
      set((state) => ({ activity: [activityItem, ...state.activity].slice(0, 50) }));
      bgLogActivity(activityItem);
    },

    updateSitemap: (projectId, sitemap) => {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId ? { ...project, sitemap, updatedAt: new Date().toISOString() } : project
        ),
      }));
      syncById(projectId);
    },

    updateIANotes: (projectId, notes) => {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId ? { ...project, iaNotes: notes, updatedAt: new Date().toISOString() } : project
        ),
      }));
      syncById(projectId);
    },

    addJourneyStage: (projectId, stage) => {
      const newStage: JourneyStage = { ...stage, id: uuid() };
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId ? { ...project, journeyStages: [...project.journeyStages, newStage] } : project
        ),
      }));
      syncById(projectId);
    },

    updateJourneyStage: (projectId, stageId, updates) => {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                journeyStages: project.journeyStages.map((stage) => (stage.id === stageId ? { ...stage, ...updates } : stage)),
              }
            : project
        ),
      }));
      syncById(projectId);
    },

    deleteJourneyStage: (projectId, stageId) => {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId
            ? { ...project, journeyStages: project.journeyStages.filter((stage) => stage.id !== stageId) }
            : project
        ),
      }));
      syncById(projectId);
    },

    moveJourneyStage: (projectId, stageId, direction) => {
      set((state) => ({
        projects: state.projects.map((project) => {
          if (project.id !== projectId) return project;
          const stages = [...project.journeyStages].sort((a, b) => a.order - b.order);
          const index = stages.findIndex((stage) => stage.id === stageId);
          if (index === -1) return project;
          const nextIndex = direction === "up" ? index - 1 : index + 1;
          if (nextIndex < 0 || nextIndex >= stages.length) return project;
          [stages[index], stages[nextIndex]] = [stages[nextIndex], stages[index]];
          return { ...project, journeyStages: stages.map((stage, order) => ({ ...stage, order })) };
        }),
      }));
      syncById(projectId);
    },

    addWireframeFile: (projectId, file) => {
      const newFile: FileMetadata = { ...file, id: file.id || uuid(), uploadedAt: new Date().toISOString() };
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId ? { ...project, wireframeFiles: [...project.wireframeFiles, newFile] } : project
        ),
      }));
      syncById(projectId);
      return newFile;
    },

    deleteWireframeFile: (projectId, fileId) => {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId
            ? { ...project, wireframeFiles: project.wireframeFiles.filter((file) => file.id !== fileId) }
            : project
        ),
      }));
      syncById(projectId);
    },

    updateWireframeFile: (projectId, fileId, updates) => {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                wireframeFiles: project.wireframeFiles.map((file) => (file.id === fileId ? { ...file, ...updates } : file)),
              }
            : project
        ),
      }));
      syncById(projectId);
    },

    addUIScreenFile: (projectId, file) => {
      const newFile: FileMetadata = { ...file, id: file.id || uuid(), uploadedAt: new Date().toISOString() };
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId ? { ...project, uiScreenFiles: [...project.uiScreenFiles, newFile] } : project
        ),
      }));
      syncById(projectId);
      return newFile;
    },

    deleteUIScreenFile: (projectId, fileId) => {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId ? { ...project, uiScreenFiles: project.uiScreenFiles.filter((file) => file.id !== fileId) } : project
        ),
      }));
      syncById(projectId);
    },

    updateUIScreenFile: (projectId, fileId, updates) => {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                uiScreenFiles: project.uiScreenFiles.map((file) => (file.id === fileId ? { ...file, ...updates } : file)),
              }
            : project
        ),
      }));
      syncById(projectId);
    },

    updatePrototype: (projectId, data) => {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId ? { ...project, ...data, updatedAt: new Date().toISOString() } : project
        ),
      }));
      syncById(projectId);
    },

    updateUIDesignNotes: (projectId, notes) => {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId ? { ...project, uiDesignNotes: notes, updatedAt: new Date().toISOString() } : project
        ),
      }));
      syncById(projectId);
    },

    addFinding: (projectId, finding) => {
      const newFinding: TestingFinding = { ...finding, id: uuid(), createdAt: new Date().toISOString() };
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId ? { ...project, testingFindings: [...project.testingFindings, newFinding] } : project
        ),
      }));
      syncById(projectId);
    },

    updateFinding: (projectId, findingId, updates) => {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                testingFindings: project.testingFindings.map((finding) =>
                  finding.id === findingId ? { ...finding, ...updates } : finding
                ),
              }
            : project
        ),
      }));
      syncById(projectId);
    },

    deleteFinding: (projectId, findingId) => {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId
            ? { ...project, testingFindings: project.testingFindings.filter((finding) => finding.id !== findingId) }
            : project
        ),
      }));
      syncById(projectId);
    },

    editProject: (id, data) => {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === id ? { ...project, ...data, updatedAt: new Date().toISOString() } : project
        ),
      }));
      syncById(id);
      get().addActivity({ text: `Project updated: ${data.name}`, type: "project", projectId: id });
    },

    deleteProjectFull: async (id) => {
      const previousProjects = get().projects;
      const previousActivity = get().activity;
      set((state) => ({
        projects: state.projects.filter((project) => project.id !== id),
        activity: state.activity.filter((activity) => activity.projectId !== id),
      }));
      try {
        await bgDeleteProject(id);
      } catch (error) {
        set({ projects: previousProjects, activity: previousActivity });
        throw error;
      }
    },

    addQuickNote: (content, projectId) => {
      const note: QuickNote = {
        id: uuid(),
        content,
        projectId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set((state) => ({ quickNotes: [note, ...state.quickNotes] }));
      bgSyncNote(note);
    },

    updateQuickNote: (id, content) => {
      set((state) => ({
        quickNotes: state.quickNotes.map((note) =>
          note.id === id ? { ...note, content, updatedAt: new Date().toISOString() } : note
        ),
      }));
      const updated = get().quickNotes.find((n) => n.id === id);
      if (updated) bgSyncNote(updated);
    },

    deleteQuickNote: (id) => {
      set((state) => ({ quickNotes: state.quickNotes.filter((note) => note.id !== id) }));
      bgDeleteNote(id);
    },

    // ---- PHASE 3 ADDITIONS ----

    updateNavMap: (projectId, map) => {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId ? { ...project, navMap: map, updatedAt: new Date().toISOString() } : project
        ),
      }));
      syncById(projectId);
    },

    setCaseStudyTemplate: (projectId, template) => {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId ? { ...project, caseStudyTemplate: template, updatedAt: new Date().toISOString() } : project
        ),
      }));
      syncById(projectId);
    },

    setPortfolioPublic: (projectId, isPublic, slug) => {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId
            ? { ...project, isPortfolioPublic: isPublic, portfolioSlug: slug, updatedAt: new Date().toISOString() }
            : project
        ),
      }));
      syncById(projectId);
    },

    archiveProject: (projectId) => {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId ? { ...project, isArchived: true, updatedAt: new Date().toISOString() } : project
        ),
      }));
      syncById(projectId);
    },

    unarchiveProject: (projectId) => {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId ? { ...project, isArchived: false, updatedAt: new Date().toISOString() } : project
        ),
      }));
      syncById(projectId);
    },

    setWireframeFileUrl: (projectId, fileId, url) => {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                wireframeFiles: project.wireframeFiles.map((file) =>
                  file.id === fileId ? { ...file, storageUrl: url } : file
                ),
              }
            : project
        ),
      }));
      syncById(projectId);
    },

    setUIScreenFileUrl: (projectId, fileId, url) => {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                uiScreenFiles: project.uiScreenFiles.map((file) =>
                  file.id === fileId ? { ...file, storageUrl: url } : file
                ),
              }
            : project
        ),
      }));
      syncById(projectId);
    },

    // ---- PROMPT VAULT ----

    addPromptEntry: (data) => {
      const now = new Date().toISOString();
      const entry: PromptEntry = { ...data, id: uuid(), createdAt: now, updatedAt: now };
      set((state) => ({ promptEntries: [entry, ...state.promptEntries] }));
      bgSyncPrompt(entry);
      return entry;
    },

    updatePromptEntry: (id, updates) => {
      set((state) => ({
        promptEntries: state.promptEntries.map((e) =>
          e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
        ),
      }));
      const updated = get().promptEntries.find((e) => e.id === id);
      if (updated) bgSyncPrompt(updated);
    },

    deletePromptEntry: (id) => {
      set((state) => ({ promptEntries: state.promptEntries.filter((e) => e.id !== id) }));
      bgDeletePrompt(id);
    },

    togglePromptFavorite: (id) => {
      set((state) => ({
        promptEntries: state.promptEntries.map((e) =>
          e.id === id ? { ...e, isFavorite: !e.isFavorite, updatedAt: new Date().toISOString() } : e
        ),
      }));
      const updated = get().promptEntries.find((e) => e.id === id);
      if (updated) bgSyncPrompt(updated);
    },

    addPromptImage: (entryId, image) => {
      const newImage: PromptImage = { ...image, id: image.id || uuid(), uploadedAt: new Date().toISOString() };
      set((state) => ({
        promptEntries: state.promptEntries.map((e) =>
          e.id === entryId ? { ...e, images: [...e.images, newImage], updatedAt: new Date().toISOString() } : e
        ),
      }));
      const updated = get().promptEntries.find((e) => e.id === entryId);
      if (updated) bgSyncPrompt(updated);
      return newImage;
    },

    deletePromptImage: (entryId, imageId) => {
      set((state) => ({
        promptEntries: state.promptEntries.map((e) =>
          e.id === entryId
            ? { ...e, images: e.images.filter((i) => i.id !== imageId), updatedAt: new Date().toISOString() }
            : e
        ),
      }));
      const updated = get().promptEntries.find((e) => e.id === entryId);
      if (updated) bgSyncPrompt(updated);
    },
  };
});
