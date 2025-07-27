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
    id: 'webhook',
    name: 'Webhook',
    category: 'source',
    icon: 'Globe',
    color: '#ec4a3f',
    description: 'Receive HTTP requests as triggers'
  },
  {
    id: 'ai-transform',
    name: 'AI Transform',
    category: 'transform',
    icon: 'Sparkle',
    color: '#8b5cf6',
    description: 'Process data using AI models'
  },
  {
    id: 'delta-plc',
    name: 'Delta PLC',
    category: 'source',
    icon: 'Factory',
    color: '#3b82f6',
    description: 'Connect to Delta PLC devices'
  },
  {
    id: 'energy-meter',
    name: 'Energy Meter',
    category: 'source',
    icon: 'Lightning',
    color: '#f59e0b',
    description: 'Read energy consumption data'
  },
  {
    id: 'mitsubishi-plc',
    name: 'Mitsubishi PLC',
    category: 'source',
    icon: 'Cpu',
    color: '#ef4444',
    description: 'Connect to Mitsubishi PLC systems'
  },
  {
    id: 'database',
    name: 'Database',
    category: 'source',
    icon: 'Database',
    color: '#6366f1',
    description: 'Connect to SQL databases'
  },
  {
    id: 'scheduler',
    name: 'Scheduler',
    category: 'source',
    icon: 'Clock',
    color: '#10b981',
    description: 'Schedule automated tasks'
  },
  {
    id: 'siemens',
    name: 'Siemens',
    category: 'source',
    icon: 'Gear',
    color: '#64748b',
    description: 'Connect to Siemens devices'
  },
  {
    id: 'transform',
    name: 'Transform',
    category: 'transform',
    icon: 'ArrowsClockwise',
    color: '#f97316',
    description: 'Transform and process data'
  },
  {
    id: 'filter',
    name: 'Filter',
    category: 'transform',
    icon: 'Funnel',
    color: '#eab308',
    description: 'Filter data based on conditions'
  },
  {
    id: 'activecampaign',
    name: 'ActiveCampaign',
    category: 'destination',
    icon: 'ArrowRight',
    color: '#2563eb',
    description: 'Send data to ActiveCampaign'
  },
  {
    id: 'output',
    name: 'Output',
    category: 'destination',
    icon: 'Export',
    color: '#22c55e',
    description: 'Send data to external systems'
  }
];