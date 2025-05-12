// src/app/(protected)/create/components/steps-indicator.tsx
'use client';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

// Step indicator props
interface StepIndicatorProps {
  number: number;
  title: string;
  isActive: boolean;
  isComplete: boolean;
}

// Single step indicator component
const StepIndicator: React.FC<StepIndicatorProps> = ({ number, title, isActive, isComplete }) => {
  let bgColor = "bg-white/20";
  let textColor = "text-white/60";
  
  if (isActive) {
    bgColor = "bg-gradient-to-r from-indigo-600 to-indigo-800";
    textColor = "text-white";
  } else if (isComplete) {
    bgColor = "bg-indigo-800/50";
    textColor = "text-white/80";
  }
  
  return (
    <div className={`flex flex-col items-center ${textColor}`}>
      <div className={`${bgColor} w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors shadow-lg mb-2`}>
        {isComplete ? <CheckCircle className="h-4 w-4" /> : number}
      </div>
      <span className="text-xs font-medium">{title}</span>
    </div>
  );
};

// Connector between steps
interface StepConnectorProps {
  isActive: boolean;
}

const StepConnector: React.FC<StepConnectorProps> = ({ isActive }) => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className={`h-1 w-full ${isActive ? 'bg-indigo-600' : 'bg-white/20'} rounded-full transition-colors mx-2`}></div>
    </div>
  );
};

// Main steps indicator component
interface StepsIndicatorProps {
  activeStep: number;
}

export const StepsIndicator: React.FC<StepsIndicatorProps> = ({ activeStep }) => {
  return (
    <motion.div 
      className="mb-10 flex items-center justify-center w-full max-w-md"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center w-full">
        <StepIndicator 
          number={1} 
          title="Repository" 
          isActive={activeStep === 1} 
          isComplete={activeStep > 1}
        />
        <StepConnector isActive={activeStep > 1} />
        <StepIndicator 
          number={2} 
          title="Credits" 
          isActive={activeStep === 2} 
          isComplete={activeStep > 2}
        />
        <StepConnector isActive={activeStep > 2} />
        <StepIndicator 
          number={3} 
          title="Complete" 
          isActive={activeStep === 3} 
          isComplete={false}
        />
      </div>
    </motion.div>
  );
};