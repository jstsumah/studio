
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
import { LoaderCircle, Sparkles } from 'lucide-react';
import { Separator } from './ui/separator';
import { useToast } from '@/hooks/use-toast';
import { clearCache } from '@/lib/data';
import { useDataRefresh } from '@/hooks/use-data-refresh';
import { Textarea } from './ui/textarea';
import { generateAvatar } from '@/ai/flows/generate-avatar-flow';

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
  const { refreshData } = useDataRefresh();
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

  const handleGenerateAvatar = async () => {
    const prompt = form.getValues('avatarPrompt');
    if (!prompt) {
      toast({
        title: 'Prompt is empty',
        description: 'Please enter a description to generate an avatar.',
        variant: 'destructive',
      });
      return;
    }
    setIsGenerating(true);
    try {
      const { avatarUrl } = await generateAvatar({ prompt });
      setNewAvatarUrl(avatarUrl);
    } catch (error) {
      console.error('Avatar generation failed:', error);
      toast({
        title: 'Avatar Generation Failed',
        description: 'Could not generate a new avatar. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  async function onSubmit(values: ProfileFormValues) {
    setIsSaving(true);
    const updateData: Partial<Employee> = {
      name: values.name,
      jobTitle: values.jobTitle,
      department: values.department,
    };

    try {
      await updateUser(updateData, newAvatarUrl);
      clearCache();
      refreshData();
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
  
  const displayAvatarSrc = newAvatarUrl ?? user.avatarUrl;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        <div className="flex items-center gap-4">
             <Avatar className="h-24 w-24">
                <AvatarImage src={displayAvatarSrc || undefined} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
             <div className='w-full space-y-2'>
                <FormField
                    control={form.control}
                    name="avatarPrompt"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>AI Avatar Prompt</FormLabel>
                        <FormControl>
                            <Textarea placeholder="e.g., A photo of a smiling woman with brown hair in a business suit." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <Button type="button" onClick={handleGenerateAvatar} disabled={isGenerating || isSaving}>
                    {isGenerating ? <LoaderCircle className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                    Generate New Avatar
                </Button>
             </div>
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
            <Button type="submit" disabled={isSaving || isGenerating}>
              {isSaving && <LoaderCircle className="animate-spin mr-2" />}
              Save Changes
            </Button>
        </div>
      </form>
    </Form>
  )
}
