"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MoreVertical, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Event, CreateEventData, UpdateEventData } from '@/types/dashboard/event';
import { createEvent, getEvents, updateEvent, deleteEvent } from '@/app/api/dashboard/events';

const initialFormData: CreateEventData = {
  title: '',
  description: '',
  event_type: '',
  start_date: '',
  end_date: '',
  location: '',
  link: ''
};

const eventTypeOptions = [
  { value: 'meeting', label: 'Meeting', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'training', label: 'Training', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'workshop', label: 'Workshop', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'conference', label: 'Conference', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { value: 'seminar', label: 'Seminar', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-700 border-gray-200' }
];

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateEventData>(initialFormData);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await getEvents();
      setEvents(response.results || []);
    } catch (err) {
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setImages(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const handleAddDocuments = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setDocuments(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateEvent = async () => {
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("start_date", formData.start_date);

      if (formData.description) fd.append("description", formData.description);
      if (formData.event_type) fd.append("event_type", formData.event_type);
      if (formData.end_date) fd.append("end_date", formData.end_date);
      if (formData.location) fd.append("location", formData.location);
      if (formData.link) fd.append("link", formData.link);

      images.forEach((img) => fd.append("images", img));
      documents.forEach((doc) => fd.append("documents", doc));

      const newEvent = await createEvent(fd);
      setEvents(prev => [newEvent, ...prev]);
      setFormData(initialFormData);
      setImages([]);
      setDocuments([]);
      setIsCreateDialogOpen(false);
    } catch (err) {
      setError("Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = (event: Event): void => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      event_type: event.event_type || '',
      start_date: event.start_date,
      end_date: event.end_date || '',
      location: event.location || '',
      link: event.link || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateEvent = async (): Promise<void> => {
    if (!selectedEvent) return;
    try {
      setLoading(true);
      const updateData: UpdateEventData = { id: selectedEvent.id, ...formData };
      const updatedEvent = await updateEvent(updateData);
      setEvents(prev => prev.map(event => event.id === selectedEvent.id ? updatedEvent : event));
      setIsEditDialogOpen(false);
      setSelectedEvent(null);
    } catch (err) {
      setError('Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string): Promise<void> => {
    try {
      await deleteEvent(eventId);
      setEvents(prev => prev.filter(event => event.id !== eventId));
    } catch (err) {
      setError('Failed to delete event');
    }
  };

  const handleViewEvent = (event: Event): void => {
    setSelectedEvent(event);
    setIsViewDialogOpen(true);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventTypeColor = (type: string) => {
    return eventTypeOptions.find(opt => opt.value === type)?.color || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
      <div className="container mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Events</h1>
            <p className="text-gray-600 mt-1">Manage all your events and attachments</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#27aae1] hover:bg-[#1e8bb8] text-white shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter event title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="event_type">Event Type</Label>
                  <Select 
                    value={formData.event_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter event description"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date & Time *</Label>
                    <Input
                      id="start_date"
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date & Time</Label>
                    <Input
                      id="end_date"
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter event location"
                  />
                </div>
                
                <div>
                  <Label htmlFor="link">Meeting Link</Label>
                  <Input
                    id="link"
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                    placeholder="https://meet.google.com/..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Event Images</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAddImages}
                    className="cursor-pointer"
                  />
                  {images.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={URL.createObjectURL(img)}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <button
                            onClick={() => removeImage(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Attach Documents</Label>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                    multiple
                    onChange={handleAddDocuments}
                    className="cursor-pointer"
                  />
                  {documents.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 border p-2 rounded-lg">
                          <span className="text-sm">{doc.name}</span>
                          <button onClick={() => removeDocument(idx)} className="text-red-500 text-xs">
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setFormData(initialFormData);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateEvent} 
                    className="bg-[#27aae1] hover:bg-[#1e8bb8]"
                    disabled={!formData.title || !formData.start_date}
                  >
                    Create Event
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading events...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No events found. Create one to get started!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Title</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Type</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Start Date</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Location</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Media</th>
                    <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="px-6 py-3 font-medium text-gray-900">{event.title}</td>
                      <td className="px-6 py-3">
                        {event.event_type && (
                          <Badge className={`${getEventTypeColor(event.event_type)} border text-xs`}>
                            {event.event_type}
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">{formatDate(event.start_date)}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{event.location || '—'}</td>
                      <td className="px-6 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          {event.images.length > 0 && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {event.images.length} {event.images.length === 1 ? 'img' : 'imgs'}
                            </span>
                          )}
                          {event.documents.length > 0 && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              {event.documents.length} {event.documents.length === 1 ? 'doc' : 'docs'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewEvent(event)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditEvent(event)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteEvent(event.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* View Event Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Event Details</DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">{selectedEvent.title}</h3>
                  {selectedEvent.event_type && (
                    <Badge className={`mt-2 ${getEventTypeColor(selectedEvent.event_type)} border`}>
                      {selectedEvent.event_type}
                    </Badge>
                  )}
                </div>

                {selectedEvent.description && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-700">{selectedEvent.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Start Date</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedEvent.start_date)}</p>
                  </div>
                  {selectedEvent.end_date && (
                    <div>
                      <p className="text-sm text-gray-600">End Date</p>
                      <p className="font-medium text-gray-900">{formatDate(selectedEvent.end_date)}</p>
                    </div>
                  )}
                </div>

                {selectedEvent.location && (
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium text-gray-900">{selectedEvent.location}</p>
                  </div>
                )}

                {selectedEvent.link && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Meeting Link</p>
                    <a href={selectedEvent.link} target="_blank" rel="noopener noreferrer" className="text-[#27aae1] hover:underline break-all">
                      {selectedEvent.link}
                    </a>
                  </div>
                )}

                {selectedEvent.images.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Images</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {selectedEvent.images.map((img) => (
                        <img key={img.id} src={img.image} alt={img.caption || 'Event image'} className="w-full h-32 object-cover rounded-lg border border-gray-200" />
                      ))}
                    </div>
                  </div>
                )}

                {selectedEvent.documents.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Documents</h4>
                    <div className="space-y-2">
                      {selectedEvent.documents.map((doc) => (
                        <a
                          key={doc.id}
                          href={doc.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <span className="text-sm font-medium text-gray-900 truncate">{doc.file.split('/').pop()}</span>
                          <Download className="h-4 w-4 text-[#27aae1]" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Event Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-event_type">Event Type</Label>
                <Select 
                  value={formData.event_type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-start_date">Start Date & Time *</Label>
                  <Input
                    id="edit-start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-end_date">End Date & Time</Label>
                  <Input
                    id="edit-end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-link">Meeting Link</Label>
                <Input
                  id="edit-link"
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setFormData(initialFormData);
                    setSelectedEvent(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateEvent} 
                  className="bg-[#27aae1] hover:bg-[#1e8bb8]"
                  disabled={!formData.title || !formData.start_date}
                >
                  Update Event
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EventsPage;