import { cn } from "@/lib/utils.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";

//@ts-ignore
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";

export default function SignupPage({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const { signup } = useAuthStore();

  const validateForm = () => {
    if (!formData.name.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email))
      return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 8)
      return toast.error("Password must be at least 8 characters");

    return true;
  };
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const success = validateForm();

    if (success === true) await signup(formData);
  };

  return (
    <div className="flex  min-h-screen flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-5xl ">
        <div className={cn("flex flex-col gap-6  ", className)} {...props}>
          <Card className="overflow-hidden h-[700px] w-full ">
            <CardContent className="items-center justify-center grid p-0 md:grid-cols-2 h-full">
              <div className="relative hidden bg-muted md:block h-full min-h-[500px]">
                <img
                  src="https://img.freepik.com/premium-photo/abstract-black-white-image-abstract-fractal-pattern_1149116-13856.jpg?semt=ais_incoming"
                  alt="Image"
                  className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
              </div>
              <form onSubmit={handleSubmit} className="p-6 md:p-8 ">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center text-center">
                    <h1 className="text-2xl font-bold">Create Account</h1>
                    <p className="text-balance text-muted-foreground">
                      Get started with your free account
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="name"
                      placeholder="John Doe"
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        type={showPassword ? "text" : "password"}
                        required
                      />
                      <Button
                        type="button"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
                        onClick={() => setShowPassword(!showPassword)}
                        variant="ghost"
                        size="sm"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    Create account
                  </Button>

                  <div className="text-center text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="underline underline-offset-4">
                      Sign in
                    </Link>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
            By clicking continue, you agree to our{" "}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
