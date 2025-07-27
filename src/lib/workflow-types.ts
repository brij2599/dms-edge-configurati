export interface NodeType {
  id: string;
  name: string;
  category: 'source' | 'transform' | 'destination';
  icon: string;
  color: string;
  description: string;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, any>;
  selected?: boolean;
  status?: 'idle' | 'running' | 'success' | 'error';
}

export interface NodeConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  connections: NodeConnection[];
  status?: 'draft' | 'running' | 'success' | 'error';
}

export const NODE_TYPES: NodeType[] = [
  {
    id: 'delta-plc',
    name: 'Delta PLC',
    category: 'source',
    icon: 'Factory',
    color: 'oklch(0.5 0.15 220)',
    description: 'Connect to Delta PLC devices'
  },
  {
    id: 'energy-meter',
    name: 'Energy Meter',
    category: 'source',
    icon: 'Lightning',
    color: 'oklch(0.6 0.15 60)',
    description: 'Read energy consumption data'
  },
  {
    id: 'mitsubishi-plc',
    name: 'Mitsubishi PLC',
    category: 'source',
    icon: 'Cpu',
    color: 'oklch(0.55 0.15 10)',
    description: 'Connect to Mitsubishi PLC systems'
  },
  {
    id: 'database',
    name: 'Database',
    category: 'source',
    icon: 'Database',
    color: 'oklch(0.45 0.12 260)',
    description: 'Connect to SQL databases'
  },
  {
    id: 'scheduler',
    name: 'Scheduler',
    category: 'source',
    icon: 'Clock',
    color: 'oklch(0.5 0.15 140)',
    description: 'Schedule automated tasks'
  },
  {
    id: 'siemens',
    name: 'Siemens',
    category: 'source',
    icon: 'Gear',
    color: 'oklch(0.3 0.05 240)',
    description: 'Connect to Siemens devices'
  },
  {
    id: 'transform',
    name: 'Transform',
    category: 'transform',
    icon: 'ArrowsClockwise',
    color: 'oklch(0.6 0.15 40)',
    description: 'Transform and process data'
  },
  {
    id: 'filter',
    name: 'Filter',
    category: 'transform',
    icon: 'Funnel',
    color: 'oklch(0.55 0.15 80)',
    description: 'Filter data based on conditions'
  },
  {
    id: 'output',
    name: 'Output',
    category: 'destination',
    icon: 'Export',
    color: 'oklch(0.6 0.15 140)',
    description: 'Send data to external systems'
  }
];