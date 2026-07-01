// Event Management Service

export interface Event {
  id: string;
  name: string;
  description: string;
  type: 'wedding' | 'portrait' | 'commercial' | 'event' | 'other';
  startDate: string;
  endDate: string;
  location: string;
  customerId: string;
  customerName: string;
  status: 'planned' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  assignedTeam: string[];
  equipment: string[];
  budget: number;
  actualCost: number;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface EventTask {
  id: string;
  eventId: string;
  title: string;
  description: string;
  assignedTo: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  completedAt?: number;
}

export class EventService {
  private static events: Event[] = [];
  private static tasks: EventTask[] = [];

  // Initialize event service
  static initialize(): void {
    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
      try {
        this.events = JSON.parse(storedEvents);
      } catch (error) {
        console.error('Failed to load events:', error);
      }
    }

    const storedTasks = localStorage.getItem('event_tasks');
    if (storedTasks) {
      try {
        this.tasks = JSON.parse(storedTasks);
      } catch (error) {
        console.error('Failed to load tasks:', error);
      }
    }
  }

  // Create event
  static createEvent(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Event {
    const newEvent: Event = {
      ...event,
      id: this.generateEventId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.events.push(newEvent);
    this.saveEvents();

    return newEvent;
  }

  // Update event
  static updateEvent(id: string, updates: Partial<Event>): Event | null {
    const index = this.events.findIndex((e) => e.id === id);
    if (index === -1) return null;

    this.events[index] = {
      ...this.events[index],
      ...updates,
      updatedAt: Date.now(),
    };

    this.saveEvents();
    return this.events[index];
  }

  // Delete event
  static deleteEvent(id: string): boolean {
    const index = this.events.findIndex((e) => e.id === id);
    if (index === -1) return false;

    this.events.splice(index, 1);
    this.saveEvents();
    return true;
  }

  // Get event by ID
  static getEventById(id: string): Event | undefined {
    return this.events.find((e) => e.id === id);
  }

  // Get all events
  static getEvents(filter?: {
    status?: Event['status'];
    type?: Event['type'];
    customerId?: string;
    startDate?: string;
    endDate?: string;
  }): Event[] {
    let filtered = [...this.events];

    if (filter?.status) {
      filtered = filtered.filter((e) => e.status === filter.status);
    }

    if (filter?.type) {
      filtered = filtered.filter((e) => e.type === filter.type);
    }

    if (filter?.customerId) {
      filtered = filtered.filter((e) => e.customerId === filter.customerId);
    }

    if (filter?.startDate) {
      filtered = filtered.filter((e) => e.startDate >= filter.startDate!);
    }

    if (filter?.endDate) {
      filtered = filtered.filter((e) => e.endDate <= filter.endDate!);
    }

    filtered.sort((a, b) => b.startDate.localeCompare(a.startDate));

    return filtered;
  }

  // Create task for event
  static createTask(task: Omit<EventTask, 'id'>): EventTask {
    const newTask: EventTask = {
      ...task,
      id: this.generateTaskId(),
    };

    this.tasks.push(newTask);
    this.saveTasks();

    return newTask;
  }

  // Update task
  static updateTask(id: string, updates: Partial<EventTask>): EventTask | null {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;

    this.tasks[index] = {
      ...this.tasks[index],
      ...updates,
    };

    if (updates.status === 'completed' && !this.tasks[index].completedAt) {
      this.tasks[index].completedAt = Date.now();
    }

    this.saveTasks();
    return this.tasks[index];
  }

  // Delete task
  static deleteTask(id: string): boolean {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) return false;

    this.tasks.splice(index, 1);
    this.saveTasks();
    return true;
  }

  // Get tasks for event
  static getTasks(eventId: string): EventTask[] {
    return this.tasks.filter((t) => t.eventId === eventId);
  }

  // Get tasks for team member
  static getTasksByTeamMember(teamMemberId: string): EventTask[] {
    return this.tasks.filter((t) => t.assignedTo === teamMemberId);
  }

  // Get event statistics
  static getStatistics(): {
    totalEvents: number;
    eventsByStatus: Record<string, number>;
    eventsByType: Record<string, number>;
    totalBudget: number;
    totalActualCost: number;
    profit: number;
    upcomingEvents: number;
    completedTasks: number;
    pendingTasks: number;
  } {
    const eventsByStatus: Record<string, number> = {};
    const eventsByType: Record<string, number> = {};
    let totalBudget = 0;
    let totalActualCost = 0;

    const now = new Date();
    const upcomingEvents = this.events.filter(
      (e) => new Date(e.startDate) > now && e.status !== 'cancelled'
    ).length;

    this.events.forEach((event) => {
      eventsByStatus[event.status] = (eventsByStatus[event.status] || 0) + 1;
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      totalBudget += event.budget;
      totalActualCost += event.actualCost;
    });

    const completedTasks = this.tasks.filter((t) => t.status === 'completed').length;
    const pendingTasks = this.tasks.filter((t) => t.status !== 'completed').length;

    return {
      totalEvents: this.events.length,
      eventsByStatus,
      eventsByType,
      totalBudget,
      totalActualCost,
      profit: totalBudget - totalActualCost,
      upcomingEvents,
      completedTasks,
      pendingTasks,
    };
  }

  // Generate event ID
  private static generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate task ID
  private static generateTaskId(): string {
    return `tsk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Save events
  private static saveEvents(): void {
    try {
      localStorage.setItem('events', JSON.stringify(this.events));
    } catch (error) {
      console.error('Failed to save events:', error);
    }
  }

  // Save tasks
  private static saveTasks(): void {
    try {
      localStorage.setItem('event_tasks', JSON.stringify(this.tasks));
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  }

  // Search events
  static searchEvents(query: string): Event[] {
    const lowerQuery = query.toLowerCase();
    return this.events.filter(
      (e) =>
        e.name.toLowerCase().includes(lowerQuery) ||
        e.description.toLowerCase().includes(lowerQuery) ||
        e.customerName.toLowerCase().includes(lowerQuery) ||
        e.location.toLowerCase().includes(lowerQuery)
    );
  }

  // Get events by date range
  static getEventsByDateRange(startDate: string, endDate: string): Event[] {
    return this.events.filter(
      (e) => e.startDate >= startDate && e.endDate <= endDate
    );
  }

  // Duplicate event
  static duplicateEvent(eventId: string): Event | null {
    const original = this.getEventById(eventId);
    if (!original) return null;

    const duplicated: Omit<Event, 'id' | 'createdAt' | 'updatedAt'> = {
      ...original,
      name: `${original.name} (نسخة)`,
      status: 'planned',
    };

    return this.createEvent(duplicated);
  }

  // Get team workload
  static getTeamWorkload(): Record<string, number> {
    const workload: Record<string, number> = {};

    this.events.forEach((event) => {
      event.assignedTeam.forEach((memberId) => {
        workload[memberId] = (workload[memberId] || 0) + 1;
      });
    });

    return workload;
  }

  // Get equipment usage
  static getEquipmentUsage(): Record<string, number> {
    const usage: Record<string, number> = {};

    this.events.forEach((event) => {
      event.equipment.forEach((equipmentId) => {
        usage[equipmentId] = (usage[equipmentId] || 0) + 1;
      });
    });

    return usage;
  }
}

export const eventService = EventService;
