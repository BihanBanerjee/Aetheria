// src/app/(protected)/dashboard/commit-log.tsx
'use client'
import useProject from "@/hooks/use-project"
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { ExternalLink, GitCommit } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const CommitLog = () => {
    const { projectId, project } = useProject();
    const {data: commits} = api.project.getCommits.useQuery({ projectId })

    if (!commits || commits.length === 0) {
        return (
            <div className="glassmorphism border border-white/20 rounded-xl p-8 text-center text-white/70">
                <GitCommit className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No commits found for this project</p>
            </div>
        );
    }

    return (
        <ul className="space-y-6">
            {commits?.map((commit, commitIdx) => {
                return (
                    <motion.li 
                        key={commit.id} 
                        className="relative flex gap-x-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: commitIdx * 0.1 }}
                    >
                        <div className={cn(
                        commitIdx === commits.length - 1 ? 'h-6' : '-bottom-6',
                        'absolute left-0 top-0 flex w-6 justify-center'
                        )}>
                            <div className="w-px translate-x-1 bg-white/30"></div>
                        </div>
                        <>
                        <img 
                            src={commit.commitAuthorAvatar} 
                            alt="commit avatar" 
                            className="relative mt-4 size-8 flex-none rounded-full bg-gray-50 ring-2 ring-indigo-500/30" 
                        />
                        <div className="flex-auto glassmorphism border border-white/20 p-3 rounded-xl">
                            <div className="flex justify-between gap-x-4">
                                <Link 
                                    target="_blank" 
                                    href={`${project?.githubUrl}/commit/${commit.commitHash}`} 
                                    className="py-0.5 text-xs leading-5 text-white/70 hover:text-white transition-colors"
                                >
                                    <span className="font-medium text-white">
                                        {commit.commitAuthorName}
                                    </span>{" "}
                                    <span className="inline-flex items-center">
                                        committed
                                        <ExternalLink className="ml-1 size-4" />
                                    </span>
                                </Link>
                            </div>
                            <span className="font-semibold text-blue-200">
                                {commit.commitMessage}
                            </span>
                            <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/80 bg-white/5 p-2 rounded-md">
                                {commit.summary}
                            </pre>
                        </div>
                        </>
                    </motion.li>
                )
            })}
        </ul>
    )
}

export default CommitLog