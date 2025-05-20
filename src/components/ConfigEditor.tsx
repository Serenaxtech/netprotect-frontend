import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAgentConfig, ConfigSection } from '@/hooks/useAgentConfig';
import { Loader2, Download, Save } from 'lucide-react';
import { toast } from 'sonner';

interface ConfigEditorProps {
  agentId: string;
  agentName: string;
  onClose: () => void;
}

export function ConfigEditor({ agentId, agentName, onClose }: ConfigEditorProps) {
  const { loading, sections, createInitialConfig, updateConfig } = useAgentConfig(agentId, agentName);
  const [editedSections, setEditedSections] = useState<ConfigSection[]>([]);

  useEffect(() => {
    if (sections.length === 0) {
      createInitialConfig();
    } else {
      setEditedSections(sections);
    }
  }, [sections, createInitialConfig]);

  const handleSectionNameChange = (index: number, newName: string) => {
    const section = editedSections[index];
    if (!section.isSectionNameEditable) return;

    if (section.isQuerySection && !newName.startsWith('[query_')) {
      toast.error('Query section names must start with [query_]');
      return;
    }

    const newSections = [...editedSections];
    newSections[index] = { ...section, name: newName };
    setEditedSections(newSections);
  };

  const handleFieldChange = (sectionIndex: number, fieldIndex: number, newValue: string) => {
    const section = editedSections[sectionIndex];
    const field = section.fields[fieldIndex];
    if (!field.isEditable) return;

    const newSections = [...editedSections];
    newSections[sectionIndex].fields[fieldIndex] = { ...field, value: newValue };
    setEditedSections(newSections);
  };

  const handleSave = async () => {
    try {
      const configContent = editedSections.map(section => {
        const fields = section.fields.map(field => `${field.key} = ${field.value}`).join('\n');
        return `${section.name}\n${fields}`;
      }).join('\n\n');

      await updateConfig(editedSections);
      toast.success('Configuration saved successfully');
      onClose();
    } catch (err) {
      toast.error('Failed to save configuration');
    }
  };

  const handleDownload = () => {
    try {
      const configContent = editedSections.map(section => {
        const fields = section.fields.map(field => `${field.key} = ${field.value}`).join('\n');
        return `${section.name}\n${fields}`;
      }).join('\n\n');

      const blob = new Blob([configContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'config.ini';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      toast.error('Failed to download configuration');
    }
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
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col bg-[#111] text-white border-gray-800">
        <DialogHeader className="px-6 py-4 border-b border-gray-800">
          <DialogTitle className="text-2xl font-bold text-white">Configure {agentName}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {editedSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="bg-[#1A1A1A] rounded-lg border border-gray-800 overflow-hidden">
                <div className="p-3 bg-[#111] border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <Input
                      value={section.name}
                      onChange={(e) => handleSectionNameChange(sectionIndex, e.target.value)}
                      disabled={!section.isSectionNameEditable}
                      className="text-sm text-white bg-[#1E1E1E]"
                    />
                    {section.isQuerySection && (
                      <span className="text-xs text-yellow-500 whitespace-nowrap">
                        (query_*)
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 space-y-2">
                  {section.fields.map((field, fieldIndex) => (
                    <div key={fieldIndex} className="flex items-center gap-2 text-sm">
                      <div className="w-2/5">
                        <Input
                          value={field.key}
                          disabled={true}
                          className="text-sm text-gray-400 bg-[#222]"
                        />
                      </div>
                      <div className="w-3/5">
                        <Input
                          value={field.value}
                          onChange={(e) => handleFieldChange(sectionIndex, fieldIndex, e.target.value)}
                          disabled={!field.isEditable}
                          className={`text-sm ${field.isEditable ? 'text-white bg-[#1E1E1E]' : 'text-gray-400 bg-[#222]'}`}
                          placeholder={field.isEditable ? 'Enter value...' : ''}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 bg-[#111] border-t border-gray-800">
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