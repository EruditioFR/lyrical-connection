
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Clock, 
  Mail, 
  Bell, 
  Zap,
  Calendar,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WorkflowSettings {
  upgradeReminders: {
    enabled: boolean;
    daysBefore: number;
    frequency: 'daily' | 'weekly';
  };
  accountExpiry: {
    enabled: boolean;
    trialPeriodDays: number;
    warningDays: number;
  };
  inactivityAlerts: {
    enabled: boolean;
    inactiveDays: number;
    adminNotification: boolean;
  };
  autoUpgrade: {
    enabled: boolean;
    requiresApproval: boolean;
  };
}

const AutomatedWorkflows = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<WorkflowSettings>({
    upgradeReminders: {
      enabled: true,
      daysBefore: 7,
      frequency: 'weekly'
    },
    accountExpiry: {
      enabled: true,
      trialPeriodDays: 30,
      warningDays: 7
    },
    inactivityAlerts: {
      enabled: true,
      inactiveDays: 30,
      adminNotification: true
    },
    autoUpgrade: {
      enabled: false,
      requiresApproval: true
    }
  });

  const handleSettingChange = (section: keyof WorkflowSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSaveSettings = () => {
    // Ici, on sauvegarderait les paramètres en base de données
    toast({
      title: "Paramètres sauvegardés",
      description: "La configuration des workflows automatisés a été mise à jour.",
    });
  };

  const workflowStatuses = [
    { name: 'Rappels d\'upgrade', active: settings.upgradeReminders.enabled, lastRun: '2024-01-10 14:30' },
    { name: 'Alertes d\'expiration', active: settings.accountExpiry.enabled, lastRun: '2024-01-10 09:00' },
    { name: 'Détection d\'inactivité', active: settings.inactivityAlerts.enabled, lastRun: '2024-01-10 12:15' },
    { name: 'Upgrade automatique', active: settings.autoUpgrade.enabled, lastRun: 'Jamais' },
  ];

  return (
    <div className="space-y-6">
      {/* Statut des workflows */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Statut des Workflows
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {workflowStatuses.map((workflow, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {workflow.active ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium">{workflow.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Dernière exécution: {workflow.lastRun}
                    </p>
                  </div>
                </div>
                <Badge variant={workflow.active ? 'default' : 'secondary'}>
                  {workflow.active ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration des workflows */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration des Workflows
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rappels d'upgrade */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <h3 className="font-medium">Rappels d'upgrade</h3>
              </div>
              <Switch
                checked={settings.upgradeReminders.enabled}
                onCheckedChange={(checked) => 
                  handleSettingChange('upgradeReminders', 'enabled', checked)
                }
              />
            </div>
            
            {settings.upgradeReminders.enabled && (
              <div className="ml-6 space-y-3 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reminderDays">Jours avant expiration</Label>
                    <Input
                      id="reminderDays"
                      type="number"
                      value={settings.upgradeReminders.daysBefore}
                      onChange={(e) => 
                        handleSettingChange('upgradeReminders', 'daysBefore', parseInt(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="reminderFreq">Fréquence</Label>
                    <select 
                      id="reminderFreq"
                      className="w-full p-2 border rounded-md"
                      value={settings.upgradeReminders.frequency}
                      onChange={(e) => 
                        handleSettingChange('upgradeReminders', 'frequency', e.target.value)
                      }
                    >
                      <option value="daily">Quotidien</option>
                      <option value="weekly">Hebdomadaire</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Expiration des comptes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <h3 className="font-medium">Expiration des comptes</h3>
              </div>
              <Switch
                checked={settings.accountExpiry.enabled}
                onCheckedChange={(checked) => 
                  handleSettingChange('accountExpiry', 'enabled', checked)
                }
              />
            </div>
            
            {settings.accountExpiry.enabled && (
              <div className="ml-6 space-y-3 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="trialPeriod">Période d'essai (jours)</Label>
                    <Input
                      id="trialPeriod"
                      type="number"
                      value={settings.accountExpiry.trialPeriodDays}
                      onChange={(e) => 
                        handleSettingChange('accountExpiry', 'trialPeriodDays', parseInt(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="warningDays">Alerte (jours avant)</Label>
                    <Input
                      id="warningDays"
                      type="number"
                      value={settings.accountExpiry.warningDays}
                      onChange={(e) => 
                        handleSettingChange('accountExpiry', 'warningDays', parseInt(e.target.value))
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Alertes d'inactivité */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <h3 className="font-medium">Alertes d'inactivité</h3>
              </div>
              <Switch
                checked={settings.inactivityAlerts.enabled}
                onCheckedChange={(checked) => 
                  handleSettingChange('inactivityAlerts', 'enabled', checked)
                }
              />
            </div>
            
            {settings.inactivityAlerts.enabled && (
              <div className="ml-6 space-y-3 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="inactiveDays">Jours d'inactivité</Label>
                  <Input
                    id="inactiveDays"
                    type="number"
                    value={settings.inactivityAlerts.inactiveDays}
                    onChange={(e) => 
                      handleSettingChange('inactivityAlerts', 'inactiveDays', parseInt(e.target.value))
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={settings.inactivityAlerts.adminNotification}
                    onCheckedChange={(checked) => 
                      handleSettingChange('inactivityAlerts', 'adminNotification', checked)
                    }
                  />
                  <Label>Notifier les administrateurs</Label>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Upgrade automatique */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <h3 className="font-medium">Upgrade automatique</h3>
              </div>
              <Switch
                checked={settings.autoUpgrade.enabled}
                onCheckedChange={(checked) => 
                  handleSettingChange('autoUpgrade', 'enabled', checked)
                }
              />
            </div>
            
            {settings.autoUpgrade.enabled && (
              <div className="ml-6 space-y-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={settings.autoUpgrade.requiresApproval}
                    onCheckedChange={(checked) => 
                      handleSettingChange('autoUpgrade', 'requiresApproval', checked)
                    }
                  />
                  <Label>Nécessite une approbation admin</Label>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4">
            <Button onClick={handleSaveSettings} className="w-full">
              Sauvegarder la configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomatedWorkflows;
