
import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import type { Employee } from "@/lib/types"
import { updateEmployee } from "@/lib/data"
import { LoaderCircle } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  // Email is not editable
  // email: z.string().email("Invalid email address"),
  department: z.string().min(1, "Department is required"),
  jobTitle: z.string().min(1, "Job title is required"),
})

export function EmployeeForm({ onFinished, departments, employee }: { onFinished: () => void, departments: string[], employee?: Employee }) {
  const { toast } = useToast()
  const router = useRouter()
  const [isSaving, setIsSaving] = React.useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: employee ? {
      name: employee.name,
      department: employee.department,
      jobTitle: employee.jobTitle,
    } : {
      name: "",
      department: "",
      jobTitle: "",
    },
  })

  const isEditing = !!employee;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!employee) return; // Should not happen in edit mode
    
    setIsSaving(true);
    try {
      await updateEmployee(employee.id, values);
      toast({
        title: "Employee Updated!",
        description: `Successfully updated ${values.name} in the system.`,
      })
      router.refresh(); // Re-fetch server-side props to get new data
      onFinished();
    } catch (error) {
       toast({
        title: "Update Failed",
        description: `Could not update ${values.name}. Please try again.`,
        variant: "destructive"
      })
    } finally {
        setIsSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
                <Input type="email" value={employee?.email} disabled />
            </FormControl>
            <FormMessage />
        </FormItem>
        <div className="grid grid-cols-2 gap-4">
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
        </div>
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onFinished}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <LoaderCircle className="animate-spin mr-2" />}
              {isEditing ? 'Save Changes' : 'Add Employee'}
            </Button>
        </div>
      </form>
    </Form>
  )
}
