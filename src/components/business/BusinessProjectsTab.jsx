import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderGit2, Plus, ExternalLink } from "lucide-react";
import { Project, BusinessClient } from '@/api/entities';
import ProjectForm from './project/ProjectForm';

export default function BusinessProjectsTab({ business }) {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, [business.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsData, clientsData] = await Promise.all([
        Project.list(),
        BusinessClient.list()
      ]);
      
      const businessProjects = projectsData.filter(p => p.business_id === business.id);
      const businessClients = clientsData.filter(c => c.business_id === business.id);
      
      setProjects(businessProjects);
      setClients(businessClients);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'in_progress':
        return 'text-blue-400';
      case 'planned':
        return 'text-yellow-400';
      case 'on_hold':
        return 'text-orange-400';
      case 'cancelled':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-semibold text-white">Projects</h2>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {showForm && (
          <ProjectForm
            businessId={business.id}
            clients={clients}
            onSave={() => {
              loadData();
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        )}

        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No projects found. Create your first project to get started.
            </div>
          ) : (
            projects.map(project => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
              >
                <div>
                  <div className="font-medium text-white">{project.name}</div>
                  <div className="text-sm text-gray-400">
                    {project.start_date && new Date(project.start_date).toLocaleDateString()}
                    {project.end_date && ` - ${new Date(project.end_date).toLocaleDateString()}`}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-medium text-white">
                      ${project.budget?.toLocaleString() || '0'}
                    </div>
                    <div className={`text-sm ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`/projects/${project.id}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
} 