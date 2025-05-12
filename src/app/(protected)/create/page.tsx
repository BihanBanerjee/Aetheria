// src/app/(protected)/create/page.tsx
'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useRefetch from '@/hooks/use-refetch';
import { api } from '@/trpc/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

// Import our modularized components using the index file
import {
  BackgroundAnimation,
  PageHeader,
  StepsIndicator,
  RepositoryForm,
  CreditsReview,
  SuccessConfirmation
} from './components';

// Type definition for form inputs
type FormInput = {
  repoUrl: string
  projectName: string
  githubToken?: string
}

const CreatePage = () => {
  const { register, handleSubmit, reset, watch } = useForm<FormInput>();
  const [activeStep, setActiveStep] = useState(1);
  const createProject = api.project.createProject.useMutation();
  const checkCredits = api.project.checkCredits.useMutation();
  const refetch = useRefetch();
  
  // Watch form values for validation and UI feedback
  const projectName = watch('projectName');
  const repoUrl = watch('repoUrl');
  const githubToken = watch('githubToken');
  
  function onSubmit(data: FormInput) {
    if (!!checkCredits.data) {
      createProject.mutate({
        name: data.projectName,
        githubUrl: data.repoUrl,
        githubToken: data.githubToken
      }, {
        onSuccess: () => {
          toast.success('Project created successfully');
          refetch();
          reset();
          // Show success animation
          setActiveStep(3);
        },
        onError: () => {
          toast.error('Failed to create project');
        }
      });
    } else {
      checkCredits.mutate({
        githubUrl: data.repoUrl,
        githubToken: data.githubToken
      });
      // Move to credits review step
      setActiveStep(2);
    }
  }

  const hasEnoughCredits = checkCredits?.data?.userCredits 
    ? checkCredits?.data?.fileCount <= checkCredits?.data?.userCredits 
    : true;

  return (
    <div className='min-h-full flex items-center justify-center py-12 text-white'>
      {/* Background animation elements */}
      <BackgroundAnimation />
      
      <motion.div
        className='flex flex-col items-center max-w-5xl w-full px-4'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Page Header */}
        <PageHeader />
        
        {/* Steps indicator */}
        <StepsIndicator activeStep={activeStep} />
        
        {/* Main content container */}
        <div className="w-full max-w-5xl">
          <AnimatePresence mode="wait">
            {activeStep === 1 && (
              <RepositoryForm 
                register={register}
                handleSubmit={handleSubmit}
                onSubmit={onSubmit}
                isLoading={checkCredits.isPending}
              />
            )}
            
            {activeStep === 2 && checkCredits.data && (
              <CreditsReview
                projectName={projectName}
                repoUrl={repoUrl}
                githubToken={githubToken}
                creditsData={checkCredits.data}
                hasEnoughCredits={hasEnoughCredits}
                isCreating={createProject.isPending}
                onBack={() => setActiveStep(1)}
                onCreateProject={() => {
                  if (hasEnoughCredits) {
                    createProject.mutate({
                      name: projectName,
                      githubUrl: repoUrl,
                      githubToken: githubToken
                    }, {
                      onSuccess: () => {
                        toast.success('Project created successfully');
                        refetch();
                        reset();
                        setActiveStep(3);
                      },
                      onError: () => {
                        toast.error('Failed to create project');
                      }
                    });
                  }
                }}
              />
            )}
            
            {activeStep === 3 && (
              <SuccessConfirmation 
                onCreateAnother={() => setActiveStep(1)} 
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

export default CreatePage;