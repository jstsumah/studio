
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { Employee } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { generateAvatar } from '@/ai/flows/generate-avatar-flow';
import { LoaderCircle } from 'lucide-react';
import { Separator } from './ui/separator';
import { useToast } from '@/hooks/use-toast';
import { clearCache } from '@/lib/data';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  department: z.string().min(1, 'Department is required'),
  avatarPrompt: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof formSchema>;

export function ProfileForm({ user, onFinished, departments }: { user: Employee, onFinished: () => void, departments: string[] }) {
  const { toast } = useToast();
  const { updateUser } = useAuth();
  const router = useRouter();
  const [newAvatarUrl, setNewAvatarUrl] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      jobTitle: user.jobTitle,
      department: user.department,
      avatarPrompt: '',
    },
  });

  async function handleGenerateAvatar() {
    const prompt = form.getValues('avatarPrompt');
    if (!prompt) {
      toast({
        title: 'Prompt Required',
        description: 'Please enter a description for your new avatar.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateAvatar({ prompt });
      setNewAvatarUrl(result.avatarUrl);
    } catch (error) {
      console.error('Avatar generation failed:', error);
      toast({
        title: 'Generation Failed',
        description: 'Could not generate a new avatar. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  }

  async function onSubmit(values: ProfileFormValues) {
    setIsSaving(true);
    const updateData: Partial<Employee> = {
      name: values.name,
      jobTitle: values.jobTitle,
      department: values.department,
    };

    if (newAvatarUrl) {
      updateData.avatarUrl = newAvatarUrl;
    }

    try {
      await updateUser(updateData);
      clearCache();
      router.refresh();
      onFinished();
    } catch (error) {
        toast({
            title: 'Update Failed',
            description: 'Could not update your profile. Please try again.',
            variant: 'destructive',
        });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
                <AvatarImage src={newAvatarUrl ?? user.avatarUrl} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>

            <FormField
            control={form.control}
            name="avatarPrompt"
            render={({ field }) => (
                <FormItem className="w-full">
                <FormLabel>Generate New Avatar</FormLabel>
                <div className="flex gap-2">
                    <FormControl>
                        <Input placeholder="e.g., A friendly cartoon robot" {...field} />
                    </FormControl>
                    <Button type="button" onClick={handleGenerateAvatar} disabled={isGenerating}>
                        {isGenerating ? <LoaderCircle className="animate-spin" /> : 'Generate'}
                    </Button>
                </div>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <Separator />
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="jobTitle"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Job Title</FormLabel>
                <FormControl>
                    <Input placeholder="e.g. Software Engineer" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {departments.map((department) => (
                            <SelectItem key={department} value={department}>{department}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onFinished}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <LoaderCircle className="animate-spin" />}
              Save Changes
            </Button>
        </div>
      </form>
    </Form>
  )
}
