"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/contexts/UserContext"
import { Tag } from "@/types"
import HologramPanel from "./HologramPanel"
import CyberButton from "./CyberButton"

interface TagManagerProps {
  selectedTags?: string[]
  onTagsChange?: (tagIds: string[]) => void
  allowSelection?: boolean
}

export default function TagManager({
  selectedTags = [],
  onTagsChange,
  allowSelection = true,
}: TagManagerProps) {
  const { user } = useUser()
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState("#00f0ff")

  const tagColors = [
    { name: "Cyan", value: "#00f0ff" },
    { name: "Purple", value: "#ff00ff" },
    { name: "Rose", value: "#fb923c" },
    { name: "Green", value: "#4ade80" },
    { name: "Blue", value: "#60a5fa" },
    { name: "Orange", value: "#fb923c" },
    { name: "Pink", value: "#f472b6" },
    { name: "Yellow", value: "#fbbf24" },
  ]

  useEffect(() => {
    if (user) {
      loadTags()
    }
  }, [user])

  const loadTags = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/tags")
      const data = await response.json()

      if (data.success) {
        setTags(data.data || [])
      }
    } catch (error) {
      console.error("Failed to load tags:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createTag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTagName.trim() || isCreating) return

    setIsCreating(true)
    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTagName.trim(),
          color: newTagColor,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setTags(prev => [...prev, data.data])
        setNewTagName("")
        setShowCreateForm(false)
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to create tag")
      }
    } catch (error) {
      console.error("Failed to create tag:", error)
      alert("Failed to create tag")
    } finally {
      setIsCreating(false)
    }
  }

  const deleteTag = async (tagId: string) => {
    if (!confirm("Delete this tag? It will be removed from all items.")) return

    try {
      const response = await fetch(`/api/tags?id=${tagId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setTags(prev => prev.filter(tag => tag.id !== tagId))
        // Remove from selected tags if present
        if (onTagsChange) {
          onTagsChange(selectedTags.filter(id => id !== tagId))
        }
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to delete tag")
      }
    } catch (error) {
      console.error("Failed to delete tag:", error)
      alert("Failed to delete tag")
    }
  }

  const toggleTagSelection = (tagId: string) => {
    if (!allowSelection || !onTagsChange) return

    const newSelection = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId]

    onTagsChange(newSelection)
  }

  if (!user) {
    return (
      <HologramPanel className="p-4 text-center">
        <p className="text-gray-400">Please sign in to manage tags</p>
      </HologramPanel>
    )
  }

  return (
    <HologramPanel className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-cyan-400 font-bold text-lg">
          {allowSelection ? "SELECT TAGS" : "MANAGE TAGS"}
        </h3>
        <CyberButton
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-3 py-1 text-sm"
        >
          + New Tag
        </CyberButton>
      </div>

      {/* Create Tag Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 border border-cyan-500/30 rounded-lg bg-cyan-950/20">
          <form onSubmit={createTag} className="space-y-4">
            <div>
              <label className="block text-cyan-300 text-sm mb-2">Tag Name</label>
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="w-full px-3 py-2 bg-black/50 border border-cyan-500/30 rounded text-cyan-100 placeholder-cyan-800 focus:outline-none focus:border-cyan-400"
                placeholder="Enter tag name"
                required
              />
            </div>

            <div>
              <label className="block text-cyan-300 text-sm mb-2">Color</label>
              <div className="flex flex-wrap gap-2">
                {tagColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setNewTagColor(color.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      newTagColor === color.value
                        ? "border-cyan-400 scale-110"
                        : "border-gray-600"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              <CyberButton
                type="submit"
                disabled={isCreating || !newTagName.trim()}
                className="px-4 py-2"
              >
                {isCreating ? "Creating..." : "Create Tag"}
              </CyberButton>
              <CyberButton
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  setNewTagName("")
                  setNewTagColor("#00f0ff")
                }}
                className="px-4 py-2 bg-gray-600/20 border-gray-500 hover:bg-gray-600/30"
              >
                Cancel
              </CyberButton>
            </div>
          </form>
        </div>
      )}

      {/* Tags List */}
      {isLoading ? (
        <div className="text-center text-cyan-400 py-4">
          Loading tags...
        </div>
      ) : tags.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <div className="text-4xl mb-2">🏷️</div>
          <p>No tags created yet</p>
          <p className="text-sm mt-2">Create your first tag to organize your favorites</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className={`flex items-center justify-between p-3 border rounded-lg transition-all ${
                allowSelection && selectedTags.includes(tag.id)
                  ? "border-cyan-400 bg-cyan-950/30"
                  : "border-gray-600 hover:border-cyan-500/50"
              }`}
            >
              <div className="flex items-center space-x-3">
                {allowSelection && (
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag.id)}
                    onChange={() => toggleTagSelection(tag.id)}
                    className="w-4 h-4 text-cyan-600 bg-black border-cyan-500 rounded focus:ring-cyan-500"
                  />
                )}

                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />

                <div>
                  <h4 className="text-cyan-300 font-medium">{tag.name}</h4>
                  <p className="text-gray-500 text-xs">
                    {tag.itemCount || 0} items • Created {new Date(tag.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {!allowSelection && (
                <button
                  onClick={() => deleteTag(tag.id)}
                  className="text-gray-500 hover:text-red-400 p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Selected Tags Summary */}
      {allowSelection && selectedTags.length > 0 && (
        <div className="mt-4 pt-4 border-t border-cyan-500/20">
          <p className="text-cyan-300 text-sm">
            {selectedTags.length} tag{selectedTags.length !== 1 ? "s" : ""} selected
          </p>
        </div>
      )}
    </HologramPanel>
  )
}