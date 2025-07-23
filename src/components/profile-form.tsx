
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
import { Camera, LoaderCircle, Upload, X } from 'lucide-react';
import { Separator } from './ui/separator';
import { useToast } from '@/hooks/use-toast';
import { clearCache } from '@/lib/data';
import { useDataRefresh } from '@/hooks/use-data-refresh';
import { Card, CardContent } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  department: z.string().min(1, 'Department is required'),
});

type ProfileFormValues = z.infer<typeof formSchema>;

export function ProfileForm({ user, onFinished, departments }: { user: Employee, onFinished: () => void, departments: string[] }) {
  const { toast } = useToast();
  const { updateUser } = useAuth();
  const { refreshData } = useDataRefresh();
  const [newAvatarDataUrl, setNewAvatarDataUrl] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      jobTitle: user.jobTitle,
      department: user.department,
    },
  });

  React.useEffect(() => {
    const getCameraPermission = async () => {
      // Only ask for permission if an avatar isn't already staged
      if (newAvatarDataUrl) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
      }
    };

    getCameraPermission();

    return () => {
        // Stop camera stream when component unmounts
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [newAvatarDataUrl]);


  function takePhoto() {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/png');
        setNewAvatarDataUrl(dataUrl);
      }
    }
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewAvatarDataUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }
  
  function clearAvatar() {
    setNewAvatarDataUrl(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  async function onSubmit(values: ProfileFormValues) {
    setIsSaving(true);
    const updateData: Partial<Employee> = {
      name: values.name,
      jobTitle: values.jobTitle,
      department: values.department,
    };

    try {
      await updateUser(updateData, newAvatarDataUrl);
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
  
  const displayAvatarSrc = newAvatarDataUrl ?? user.avatarUrl;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <Card>
                <CardContent className="p-2 aspect-square flex items-center justify-center bg-muted overflow-hidden">
                    {newAvatarDataUrl ? (
                        <img src={newAvatarDataUrl} alt="New Avatar Preview" className="h-full w-full object-cover" />
                    ) : hasCameraPermission ? (
                        <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted playsInline />
                    ) : (
                        <div className="flex flex-col items-center text-center text-muted-foreground p-4">
                            <Camera className="h-12 w-12 mb-2" />
                            <p className="text-sm">Camera not available or permission denied.</p>
                            <p className="text-xs">You can still upload an image.</p>
                        </div>
                    )}
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                </CardContent>
            </Card>

             <div className="flex flex-col gap-2">
                 <h3 className="font-semibold">Update Profile Picture</h3>
                {hasCameraPermission === false && (
                    <Alert variant="destructive" className="text-xs">
                        <AlertTitle>Camera Access Denied</AlertTitle>
                        <AlertDescription>
                            Please enable camera permissions in your browser settings to take a photo.
                        </AlertDescription>
                    </Alert>
                )}
                <Button type="button" onClick={takePhoto} disabled={isSaving || !hasCameraPermission || !!newAvatarDataUrl}>
                    <Camera className="mr-2" />
                    Take Photo
                </Button>
                <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={isSaving || !!newAvatarDataUrl}>
                    <Upload className="mr-2" />
                    Upload Image
                </Button>
                 {newAvatarDataUrl && (
                    <Button type="button" variant="outline" onClick={clearAvatar} disabled={isSaving}>
                        <X className="mr-2" />
                        Clear Image
                    </Button>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    style={{ display: 'none' }}
                />
            </div>
        </div>


        <Separator />
        
        <div className="flex items-center gap-4">
             <Avatar className="h-16 w-16">
                <AvatarImage src={displayAvatarSrc} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
             <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem className="flex-grow">
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g. Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
        </div>
       
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
              {isSaving && <LoaderCircle className="animate-spin mr-2" />}
              Save Changes
            </Button>
        </div>
      </form>
    </Form>
  )
}
