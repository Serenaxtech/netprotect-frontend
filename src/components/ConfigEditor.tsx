import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAgentConfig, ConfigSection } from '@/hooks/useAgentConfig';
import { Loader2, Download, Save } from 'lucide-react';
import { toast } from 'sonner';

interface ConfigEditorProps {
  agentId: string;
  agentName: string;
  onClose: () => void;
}

export function ConfigEditor({ agentId, agentName, onClose }: ConfigEditorProps) {
  const { loading, error, sections, createInitialConfig, updateConfig } = useAgentConfig(agentId, agentName);
  const [editedSections, setEditedSections] = useState<ConfigSection[]>([]);

  useEffect(() => {
    if (sections.length === 0) {
      createInitialConfig();
    } else {
      setEditedSections(sections);
    }
  }, [sections, createInitialConfig]);

  const handleSectionChange = (index: number, newContent: string) => {
    if (editedSections[index].name === '[agent]') {
      // For agent section, only allow editing AUTH-Token line
      const lines = editedSections[index].content.split('\n');
      const newLines = newContent.split('\n');
      const updatedLines = lines.map((line, i) => {
        if (line.trim().startsWith('AUTH-Token')) {
          return newLines[i];
        }
        return line;
      });
      const newSections = [...editedSections];
      newSections[index] = { 
        ...newSections[index], 
        content: updatedLines.join('\n')
      };
      setEditedSections(newSections);
    } else {
      // For other sections, allow full editing
      const newSections = [...editedSections];
      newSections[index] = { ...newSections[index], content: newContent };
      setEditedSections(newSections);
    }
  };

  const handleSave = async () => {
    try {
      await updateConfig(editedSections);
      toast.success('Configuration saved successfully');
      onClose();
    } catch (err) {
      toast.error('Failed to save configuration');
    }
  };

  const handleDownload = () => {
    const content = editedSections.map(section => section.content.trim()).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agentName}_config.ini`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="bg-[#111] text-white border-gray-800">
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure {agentName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {editedSections.map((section, index) => (
            <div key={index} className="space-y-2">
              <label className="text-sm font-medium text-gray-400">
                {section.name}
                {section.name === '[agent]' && (
                  <span className="ml-2 text-xs text-yellow-500">
                    (Only AUTH-Token is editable)
                  </span>
                )}
              </label>
              <Textarea
                value={section.content}
                onChange={(e) => handleSectionChange(index, e.target.value)}
                disabled={false} // Remove the disabled condition
                className="font-mono bg-[#1A1A1A] border-gray-800"
                rows={section.content.split('\n').length}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <Button
            variant="outline"
            className="bg-[#222] text-white hover:bg-[#333]"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={handleSave}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}