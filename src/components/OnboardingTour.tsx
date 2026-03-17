import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    target: 'dashboard',
    title: 'Welcome to the Dashboard',
    content: 'This is your central hub for monitoring all CRF activities, deployments, and system health.',
    position: 'bottom',
  },
  {
    target: 'nav-notifications',
    title: 'Notifications',
    content: 'Stay updated with real-time notifications about deployments, approvals, and system events.',
    position: 'right',
  },
  {
    target: 'nav-versions',
    title: 'Version Management',
    content: 'Manage all software versions, release notes, and version history from here.',
    position: 'right',
  },
  {
    target: 'nav-crf',
    title: 'CRF Workflow',
    content: 'Create, review, and manage Change Request Forms with customizable approval workflows.',
    position: 'right',
  },
  {
    target: 'nav-clients',
    title: 'Client Management',
    content: 'Track which clients are on which versions and manage client update schedules.',
    position: 'right',
  },
  {
    target: 'nav-deployment',
    title: 'Deployment Queue',
    content: 'Monitor and manage automated deployments with real-time status updates.',
    position: 'right',
  },
];

export function OnboardingTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('hasSeenOnboardingTour');
    if (!seen) {
      // Delay tour start to allow page to render
      setTimeout(() => setIsActive(true), 1000);
    } else {
      setHasSeenTour(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    localStorage.setItem('hasSeenOnboardingTour', 'true');
    setIsActive(false);
    setHasSeenTour(true);
  };

  const skipTour = () => {
    completeTour();
  };

  const restartTour = () => {
    localStorage.removeItem('hasSeenOnboardingTour');
    setCurrentStep(0);
    setIsActive(true);
    setHasSeenTour(false);
  };

  if (!isActive) {
    return hasSeenTour ? (
      <button
        onClick={restartTour}
        className="fixed bottom-20 right-4 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-sm z-50"
        aria-label="Restart tour"
      >
        Restart Tour
      </button>
    ) : null;
  }

  const step = tourSteps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[100]" />

      {/* Tour Card */}
      <div className="fixed inset-0 z-[101] pointer-events-none">
        <div className="flex items-center justify-center h-full p-4">
          <Card className="w-full max-w-md pointer-events-auto">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Step {currentStep + 1} of {tourSteps.length}
                  </p>
                </div>
                <button
                  onClick={skipTour}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close tour"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-gray-700 mb-6">{step.content}</p>

              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {tourSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 w-8 rounded-full transition-colors ${
                        index === currentStep ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevious}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                  )}
                  <Button size="sm" onClick={handleNext}>
                    {currentStep === tourSteps.length - 1 ? (
                      'Finish'
                    ) : (
                      <>
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
