
"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, LoaderCircle } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useToast } from "@/hooks/use-toast"
import type { Asset, Company } from "@/lib/types"
import { addAsset, clearCache, updateAsset } from "@/lib/data"
import { useDataRefresh } from "@/hooks/use-data-refresh"

const formSchema = z.object({
  serialNumber: z.string().min(1, "Serial number is required"),
  tagNo: z.string().min(1, "Tag number is required"),
  category: z.enum(["Laptop", "Desktop", "Phone", "Tablet", "Other"]),
  companyId: z.string().min(1, "Company is required"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  purchaseDate: z.date({
    required_error: "A purchase date is required.",
  }),
  assetValue: z.coerce.number().min(0, "Asset value must be a positive number."),
})

type RegisterAssetFormValues = z.infer<typeof formSchema>;

export function RegisterAssetForm({ onFinished, companies, asset, assets }: { onFinished: () => void, companies: Company[], asset?: Asset | null, assets: Asset[] }) {
  const { toast } = useToast()
  const { refreshData } = useDataRefresh();
  const [isSaving, setIsSaving] = React.useState(false);

  const isEditing = !!asset;

  const form = useForm<RegisterAssetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serialNumber: asset?.serialNumber ?? "",
      tagNo: asset?.tagNo ?? "",
      brand: asset?.brand ?? "",
      model: asset?.model ?? "",
      category: asset?.category ?? undefined,
      companyId: asset?.companyId ?? undefined,
      purchaseDate: asset?.purchaseDate ? new Date(asset.purchaseDate) : undefined,
      assetValue: asset?.assetValue ?? 0,
    },
  })

  async function onSubmit(values: RegisterAssetFormValues) {
    setIsSaving(true);
    
    // Check for duplicate tagNo
    const tagConflict = assets.find(a => a.tagNo && a.tagNo.toLowerCase() === values.tagNo.toLowerCase());
    if (tagConflict && (!isEditing || tagConflict.id !== asset.id)) {
      toast({
        title: "Duplicate Tag Number",
        description: `The tag "${values.tagNo}" is already assigned to another asset (${tagConflict.serialNumber}). Please use a unique tag.`,
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }

    const assetData = {
      ...values,
      purchaseDate: format(values.purchaseDate, 'yyyy-MM-dd'),
    };

    try {
      if (isEditing && asset) {
        await updateAsset(asset.id, assetData);
        toast({
          title: "Asset Updated!",
          description: `Asset ${values.serialNumber} has been updated.`,
        });
      } else {
        await addAsset(assetData);
        toast({
          title: "Asset Registered!",
          description: `Asset ${values.serialNumber} has been added to the inventory.`,
        });
      }
      clearCache();
      refreshData();
      onFinished();
    } catch (error) {
      console.error("Failed to save asset:", error);
      toast({
        title: isEditing ? "Update Failed" : "Registration Failed",
        description: "Could not save the asset. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="serialNumber"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Serial Number</FormLabel>
                <FormControl>
                    <Input placeholder="e.g. SN-LAP-005" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="tagNo"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Tag No</FormLabel>
                <FormControl>
                    <Input placeholder="e.g. ASSET-001" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an asset category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Laptop">Laptop</SelectItem>
                  <SelectItem value="Desktop">Desktop</SelectItem>
                  <SelectItem value="Phone">Phone</SelectItem>
                  <SelectItem value="Tablet">Tablet</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="companyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Dell" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. XPS 15" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Purchase Date</FormLabel>
                <Popover>
                    <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                        variant={"outline"}
                        className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                        )}
                        >
                        {field.value ? (
                            format(field.value, "PPP")
                        ) : (
                            <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
                control={form.control}
                name="assetValue"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Asset Value (KES)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="e.g. 1500" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onFinished} disabled={isSaving}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Register Asset'}
            </Button>
        </div>
      </form>
    </Form>
  )
}
