import React from "react";
import { Card } from "@/components/ui/card";
import { Leaf, Mountain, Users } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="relative">
                <Mountain className="h-12 w-12 text-emerald-600" />
                <Leaf className="h-6 w-6 text-amber-600 absolute -bottom-1 -right-1" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-emerald-800">
                  EcoRwanda
                </h1>
                <p className="text-sm text-emerald-600">Conservation Portal</p>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-gray-900">
                Protecting Rwanda's
                <span className="text-emerald-600"> Ecosystem</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-md mx-auto lg:mx-0">
                Join thousands of volunteers, researchers, and rangers working
                together to conserve Rwanda's precious wildlife and natural
                habitats.
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-white/50">
              <Users className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Community Driven</h3>
              <p className="text-sm text-gray-600">
                Volunteers making a difference
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/50">
              <Mountain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">
                Scientific Research
              </h3>
              <p className="text-sm text-gray-600">Data-driven conservation</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/50">
              <Leaf className="h-8 w-8 text-amber-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Real Impact</h3>
              <p className="text-sm text-gray-600">Measurable results</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-emerald-600">2,400+</div>
              <div className="text-sm text-gray-600">Active Volunteers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">150+</div>
              <div className="text-sm text-gray-600">Research Projects</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">98%</div>
              <div className="text-sm text-gray-600">Report Accuracy</div>
            </div>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="p-8 shadow-xl bg-white/90 backdrop-blur-sm border-0">
            <div className="space-y-2 text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
              <p className="text-gray-600">{subtitle}</p>
            </div>
            {children}
          </Card>
        </div>
      </div>
    </div>
  );
};
