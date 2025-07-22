import { SignupForm } from '@/components/signup-form';
import { Logo } from '@/components/icons/logo';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
           <div className="flex items-center gap-2">
            <Logo className="size-8 text-primary" />
            <span className="text-2xl font-semibold text-foreground font-headline">
              AssetWise
            </span>
          </div>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
