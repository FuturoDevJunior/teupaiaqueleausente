import React from 'react';

const LoadingAnimation = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4" data-testid="loading-animation">
        <div className="h-8 w-8 animate-spin text-primary border-2 border-current border-t-transparent rounded-full" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingAnimation;
