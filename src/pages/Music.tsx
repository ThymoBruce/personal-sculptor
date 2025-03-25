
import React, { useEffect } from 'react';

const MusicPage = () => {
  useEffect(() => {
    // In the problematic part of Music.tsx where click() is used on an Element
    // Instead of directly using element.click(), check if it's an HTMLElement first
    const tabTrigger = document.querySelector('[data-value="player"]');
    if (tabTrigger instanceof HTMLElement) {
      tabTrigger.click();
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <h1 className="text-3xl font-bold mb-6">Music</h1>
      <p className="text-gray-600 mb-8">
        Check out my latest music releases and projects.
      </p>
      
      {/* Music content will go here */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <p>Music content coming soon...</p>
      </div>
    </div>
  );
};

export default MusicPage;
