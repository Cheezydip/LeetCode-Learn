import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { DashboardPage } from './pages/DashboardPage';
import { GrowthPage } from './pages/GrowthPage';
import { RadarPage } from './pages/RadarPage';
import { RoadmapsPage } from './pages/RoadmapsPage';
import { PracticePage } from './pages/PracticePage';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="growth" element={<GrowthPage />} />
          <Route path="topics" element={<RadarPage />} />
          <Route path="paths" element={<RoadmapsPage />} />
          <Route path="paths/:topicId" element={<RoadmapsPage />} />
          <Route path="practice" element={<PracticePage />} />
          {/* Redirect old routes to new ones */}
          <Route path="radar" element={<Navigate to="/topics" replace />} />
          <Route path="roadmaps" element={<Navigate to="/paths" replace />} />
          <Route path="roadmaps/:topicId" element={<Navigate to="/paths" replace />} />
          <Route path="upsolve" element={<Navigate to="/practice" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
