import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Play, Stop, Save, Settings, User } from '@phosphor-icons/react';

interface WorkflowHeaderProps {
  workflowName: string;
  workflowStatus?: 'draft' | 'running' | 'success' | 'error';
  onRun: () => void;
  onStop: () => void;
  onSave: () => void;
  onTestConnection?: () => void;
}

export function WorkflowHeader({ 
  workflowName, 
  workflowStatus = 'draft',
  onRun,
  onStop,
  onSave,
  onTestConnection
}: WorkflowHeaderProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [name, setName] = React.useState(workflowName);

  const handleNameSubmit = () => {
    setIsEditing(false);
    // Here you would update the workflow name
  };

  const getStatusColor = () => {
    switch (workflowStatus) {
      case 'running': return 'bg-blue-500';
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = () => {
    switch (workflowStatus) {
      case 'running': return 'Running';
      case 'success': return 'Success';
      case 'error': return 'Error';
      default: return 'Draft';
    }
  };

  return (
    <div className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">N</span>
          </div>
          
          {isEditing ? (
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
              className="text-lg font-semibold w-64"
              autoFocus
            />
          ) : (
            <h1 
              className="text-lg font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
              onClick={() => setIsEditing(true)}
            >
              {name}
            </h1>
          )}
        </div>
        
        <Separator orientation="vertical" className="h-6" />
        
        <Badge variant="outline" className="gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
          {getStatusLabel()}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        {onTestConnection && (
          <Button variant="secondary" size="sm" onClick={onTestConnection}>
            Test Connection
          </Button>
        )}
        
        <Button variant="outline" size="sm" onClick={onSave}>
          <Save size={16} />
          Save
        </Button>
        
        <Button variant="outline" size="sm">
          <Settings size={16} />
          Settings
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        {workflowStatus === 'running' ? (
          <Button variant="outline" size="sm" onClick={onStop}>
            <Stop size={16} />
            Stop
          </Button>
        ) : (
          <Button size="sm" onClick={onRun}>
            <Play size={16} />
            Execute
          </Button>
        )}
        
        <Separator orientation="vertical" className="h-6" />
        
        <Button variant="ghost" size="sm">
          <User size={16} />
          User
        </Button>
      </div>
    </div>
  );
}