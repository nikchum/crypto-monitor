// components/notification-settings.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useMonitorStore } from "@/store/monitorStore";

export function NotificationSettingsForm() {
  const { settings, updateSettings } = useMonitorStore();

  return (
    <div className="border p-4 rounded-lg space-y-3 bg-secondary/20 shadow-inner">
      <h3 className="text-xl font-semibold mb-3">⚙️ Общие настройки уведомлений</h3>

      <div className="flex items-center space-x-4">
        <Label htmlFor="global-limit" className="min-w-[180px] font-medium">
          Лимит разницы для оповещения (%)
        </Label>
        <Input
          id="global-limit"
          type="number"
          step="0.1"
          value={settings.priceLimit}
          onChange={(e) => updateSettings({ priceLimit: e.target.value })}
          className="w-full max-w-[80px]"
          placeholder=""
        />
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <Checkbox
          id="global-desktop"
          checked={settings.enableDesktop}
          onCheckedChange={(checked) => updateSettings({ enableDesktop: !!checked })}
        />
        <Label htmlFor="global-desktop">Включить уведомления на рабочий стол</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="global-sound"
          checked={settings.enableSound}
          onCheckedChange={(checked) => updateSettings({ enableSound: !!checked })}
        />
        <Label htmlFor="global-sound">Включить звуковой сигнал</Label>
      </div>
    </div>
  );
}
