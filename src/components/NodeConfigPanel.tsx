import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2, Settings } from '@phosphor-icons/react';
import { WorkflowNode } from '@/lib/workflow-types';
import { NODE_TYPES } from '@/lib/workflow-types';
import { useWorkflowContext } from '@/contexts/WorkflowContext';
import * as PhosphorIcons from '@phosphor-icons/react';

interface NodeConfigPanelProps {
  node: WorkflowNode | null;
  onClose: () => void;
}

export function NodeConfigPanel({ node, onClose }: NodeConfigPanelProps) {
  const { updateNode, deleteNode } = useWorkflowContext();
  
  if (!node) return null;
  
  const nodeType = NODE_TYPES.find(type => type.id === node.type);
  const IconComponent = nodeType ? (PhosphorIcons as any)[nodeType.icon] || PhosphorIcons.Circle : PhosphorIcons.Circle;

  const handleDelete = () => {
    deleteNode(node.id);
    onClose();
  };

  const handleConfigChange = (key: string, value: any) => {
    updateNode(node.id, {
      data: { ...node.data, [key]: value }
    });
  };

  const renderConfigFields = () => {
    if (!nodeType) return null;

    // Configuration fields based on node type
    const configFields = {
      'delta-plc': [
        { key: 'host', label: 'PLC Host', type: 'text', placeholder: '192.168.1.100' },
        { key: 'port', label: 'Port', type: 'number', placeholder: '502' },
        { key: 'slaveId', label: 'Slave ID', type: 'number', placeholder: '1' }
      ],
      'energy-meter': [
        { key: 'meterId', label: 'Meter ID', type: 'text', placeholder: 'EM001' },
        { key: 'protocol', label: 'Protocol', type: 'select', options: ['Modbus', 'RS485', 'Ethernet'] },
        { key: 'pollInterval', label: 'Poll Interval (ms)', type: 'number', placeholder: '1000' }
      ],
      'database': [
        { key: 'connectionString', label: 'Connection String', type: 'text', placeholder: 'postgresql://...' },
        { key: 'table', label: 'Table Name', type: 'text', placeholder: 'sensor_data' },
        { key: 'query', label: 'SQL Query', type: 'textarea', placeholder: 'SELECT * FROM...' }
      ],
      'transform': [
        { key: 'expression', label: 'Transform Expression', type: 'textarea', placeholder: 'value * 1.5 + offset' },
        { key: 'outputField', label: 'Output Field', type: 'text', placeholder: 'processed_value' }
      ]
    };

    const fields = configFields[node.type as keyof typeof configFields] || [];

    return fields.map(field => (
      <div key={field.key} className="space-y-2">
        <Label htmlFor={field.key} className="text-sm font-medium">
          {field.label}
        </Label>
        {field.type === 'textarea' ? (
          <textarea
            id={field.key}
            className="w-full px-3 py-2 border border-input rounded-md text-sm resize-none"
            rows={3}
            placeholder={field.placeholder}
            value={node.data[field.key] || ''}
            onChange={(e) => handleConfigChange(field.key, e.target.value)}
          />
        ) : field.type === 'select' ? (
          <select
            id={field.key}
            className="w-full px-3 py-2 border border-input rounded-md text-sm"
            value={node.data[field.key] || ''}
            onChange={(e) => handleConfigChange(field.key, e.target.value)}
          >
            <option value="">Select...</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ) : (
          <Input
            id={field.key}
            type={field.type}
            placeholder={field.placeholder}
            value={node.data[field.key] || ''}
            onChange={(e) => handleConfigChange(field.key, e.target.value)}
          />
        )}
      </div>
    ));
  };

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-md flex items-center justify-center text-white"
              style={{ backgroundColor: nodeType?.color || '#666' }}
            >
              <IconComponent size={16} weight="fill" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {nodeType?.name || 'Unknown Node'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {nodeType?.description}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {nodeType?.category}
          </Badge>
          <Badge 
            variant={node.status === 'error' ? 'destructive' : 'default'}
            className="gap-1"
          >
            <div className={`w-2 h-2 rounded-full ${
              node.status === 'running' ? 'bg-blue-500' :
              node.status === 'success' ? 'bg-green-500' :
              node.status === 'error' ? 'bg-red-500' :
              'bg-gray-400'
            }`} />
            {node.status || 'idle'}
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Settings size={16} />
              Configuration
            </h3>
            <div className="space-y-4">
              {renderConfigFields()}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Node Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Node ID:</span>
                <span className="font-mono text-xs">{node.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Position:</span>
                <span className="font-mono text-xs">
                  {Math.round(node.position.x)}, {Math.round(node.position.y)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-border">
        <Button 
          variant="destructive" 
          size="sm" 
          className="w-full"
          onClick={handleDelete}
        >
          <Trash2 size={16} />
          Delete Node
        </Button>
      </div>
    </div>
  );
}