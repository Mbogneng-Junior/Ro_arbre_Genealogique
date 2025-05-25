import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";

interface StepControlsProps {
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  step: number;
  maxStep: number;
}

export default function StepControls({ onNext, onPrev, onReset, step, maxStep }: StepControlsProps) {
  return (
    <div className="flex justify-between items-center gap-4 mt-6">
      <Button onClick={onPrev} disabled={step === 0} variant="outline">
        <ArrowLeft className="mr-2 h-4 w-4" /> Étape précédente
      </Button>
      <div className="text-gray-600 font-medium">Étape {step + 1} / {maxStep}</div>
      <div className="flex gap-2">
        <Button onClick={onReset} variant="destructive">
          <RotateCcw className="mr-2 h-4 w-4" /> Réinitialiser
        </Button>
        <Button onClick={onNext} disabled={step >= maxStep - 1}>
          Étape suivante <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}