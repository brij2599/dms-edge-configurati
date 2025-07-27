import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Search, Plus } from '@phosphor-icons/react';
import { NODE_TYPES, NodeType } from '@/lib/workflow-types';
import * as PhosphorIcons from '@phosphor-icons/react';

interface NodeLibraryProps {
  onDragStart: (type: string, event: React.DragEvent) => void;
}

export function NodeLibrary({ onDragStart }: NodeLibraryProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredNodes = NODE_TYPES.filter(node =>
    node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedNodes = filteredNodes.reduce((acc, node) => {
    const category = node.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(node);
    return acc;
  }, {} as Record<string, NodeType[]>);

  const categoryLabels = {
    source: 'Data Sources',
    transform: 'Transformations',
    destination: 'Destinations'
  };

  const handleDragStart = (nodeType: string) => (event: React.DragEvent) => {
    onDragStart(nodeType, event);
  };

  const NodeItem = ({ node }: { node: NodeType }) => {
    const IconComponent = (PhosphorIcons as any)[node.icon] || PhosphorIcons.Circle;
    
    return (
      <div
        draggable
        onDragStart={handleDragStart(node.id)}
        className="group cursor-grab active:cursor-grabbing"
      >
        <Card className="p-3 hover:shadow-sm transition-all duration-200 border-2 border-transparent hover:border-primary/20 group-active:scale-95">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-md flex items-center justify-center text-white"
              style={{ backgroundColor: node.color }}
            >
              <IconComponent size={16} weight="fill" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-foreground truncate">
                {node.name}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {node.description}
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div data-node-library className="w-80 bg-card border-r border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Workflow Nodes</h2>
          <Button size="sm" variant="outline">
            <Plus size={16} />
          </Button>
        </div>
        
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {Object.entries(groupedNodes).map(([category, nodes]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-medium text-foreground">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {nodes.length}
                </Badge>
              </div>
              
              <div className="space-y-2">
                {nodes.map(node => (
                  <NodeItem key={node.id} node={node} />
                ))}
              </div>
              
              {category !== 'destination' && <Separator className="mt-4" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}