import React from 'react';
import { useParams } from 'react-router-dom';

// Import the section components
import ProjectTasks from '../../components/lawyer/project/ProjectTasks';
import ProjectHistory from '../../components/lawyer/project/ProjectHistory';
import ProjectDocuments from '../../components/lawyer/project/ProjectDocuments';
import ProjectNotes from '../../components/lawyer/project/ProjectNotes';
import ProjectAiAssistant from '../../components/lawyer/project/ProjectAiAssistant';
import ProjectFinance from '../../components/lawyer/project/ProjectFinance';
import ProjectAgenda from '../../components/lawyer/project/ProjectAgenda';

// This component renders the summary cards for the main project detail view
function ProjectSummaryDashboard() {
  const { projectId } = useParams(); // Get projectId from the parent route

  // Note: We don't need to fetch project details here again, 
  // as that's handled by the parent ProjectDetailPage.
  // We just need the projectId to pass down.

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
      {/* Column 1 */}
      <div className="space-y-6">
        {/* Tasks Summary Card */}
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <ProjectTasks projectId={projectId} isSummary={true} /> 
        </div>
        {/* Agenda Summary Card */}
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <ProjectAgenda projectId={projectId} isSummary={true} />
        </div>
      </div>

      {/* Column 2 */}
      <div className="space-y-6">
         {/* Documents Summary Card */}
         <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
           <ProjectDocuments projectId={projectId} isSummary={true} />
         </div>
         {/* Notes Summary Card */}
         <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
           <ProjectNotes projectId={projectId} isSummary={true} />
         </div>
      </div>

      {/* Column 3 */}
      <div className="space-y-6 md:col-span-2 lg:col-span-1"> {/* Adjust span as needed */}
         {/* History Summary Card */}
         <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
           <ProjectHistory projectId={projectId} isSummary={true} />
         </div>
         {/* Finance Summary Card */}
         <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
           <ProjectFinance projectId={projectId} isSummary={true} />
         </div>
          {/* AI Assistant Summary Card */}
         <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
           <ProjectAiAssistant projectId={projectId} isSummary={true} />
         </div>
      </div>

    </div> // End Grid
  );
}

export default ProjectSummaryDashboard;