
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Folder } from "lucide-react";
import { createPageUrl } from "@/utils";
import { useNavigate } from 'react-router-dom';
import { Project, Business, BusinessClient } from '@/api/entities';
import { ProjectForm } from '@/components/project-form';

export default function BusinessProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [clients, setClients] = useState([]);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get business ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const businessId = urlParams.get('business');
        
        if (!businessId) {
          navigate(createPageUrl('Business'));
          return;
        }
        
        // Load business, clients and projects
        const [businessData, clientsData, projectsData] = await Promise.all([
          Business.list(),
          BusinessClient.list(),
          Project.list()
        ]);
        
        const currentBusiness = businessData.find(b => b.id === businessId);
        
        if (!currentBusiness) {
          navigate(createPageUrl('Business'));
          return;
        }
        
        setBusiness(currentBusiness);
        
        // Filter related data
        const businessClients = clientsData.filter(c => c.business_id === businessId);
        const businessProjects = projectsData.filter(p => p.business_id === businessId);
        
        setClients(businessClients);
        setProjects(businessProjects);
      } catch (error) {
        console.error("Error loading projects data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [navigate]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => navigate(createPageUrl('Business'))}
          className="border-gray-700 bg-gray-800 hover:bg-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          {business && (
            <p className="text-gray-400">Manage projects for {business.name}</p>
          )}
        </div>
      </div>
      
      {loading ? (
        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="p-6 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-white">Project List</CardTitle>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <Folder className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No Projects Yet</h3>
                <p className="text-gray-400 mb-6">Create your first project to start tracking progress and revenue.</p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Project
                </Button>
              </div>
            ) : (
              <div>
                {/* Project list will go here */}
                <div className="text-center py-8 text-gray-400">
                  Project management functionality is coming soon
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Add New Project</h2>
            <ProjectForm 
              businessId={business.id}
              clients={clients}
              onSave={async (formData) => {
                try {
                  await Project.create(formData);
                  setShowForm(false);
                  // Reload projects
                  const projectsData = await Project.list();
                  const businessProjects = projectsData.filter(p => p.business_id === business.id);
                  setProjects(businessProjects);
                } catch (error) {
                  console.error("Error creating project:", error);
                  alert("Failed to create project. Please try again.");
                }
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
