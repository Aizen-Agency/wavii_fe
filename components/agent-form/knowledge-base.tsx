import { Button } from "@/components/ui/button"
import { Upload, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchKnowledgeBases, uploadFilesThunk, deleteKnowledgeBaseThunk } from "@/store/knowledgeBaseSlice"
import { fetchAgentById } from '@/store/agentSlice'
import { RootState } from '@/store/store'
import { AppDispatch } from '@/store/store'
import PermissionWrapper from "../PermissionWrapper"
import { usePermissionContext } from '@/contexts/PermissionContext'

interface KnowledgeBase {
  knowledge_base_id: number;
  knowledge_base_sources: {
    filename: string;
    file_url: string;
    file_size: string;
  }[];
}


interface KnowledgeBaseProps {
    formData: {
      id: number
     
      personality: string
     
    }
    updateFormData: (data: Partial<KnowledgeBaseProps["formData"]>) => void
  }
  

export function KnowledgeBase({ formData }: KnowledgeBaseProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { checkPermission } = usePermissionContext();
  const { knowledgeBases, status, error } = useSelector((state: RootState) => state.knowledgeBase)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    // Check permission before fetching knowledge bases
    const canViewKnowledgeBases = checkPermission(10, 2);
    if (canViewKnowledgeBases) {
      dispatch(fetchKnowledgeBases(formData.id))
      dispatch(fetchAgentById(formData.id))
    }
  }, [dispatch, checkPermission])

//   useEffect(() => {
//     if (status === 'succeeded') {
//       alert('Files uploaded and knowledge bases created successfully');
//     }
//   }, [status]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setSelectedFiles(fileArray);
    }
  };

  const handleNextClick = () => {
    // Check permission before uploading files

    if (selectedFiles.length > 0) {
      dispatch(uploadFilesThunk({ agentId: formData.id, files: selectedFiles }));
    } else {
      alert("Please select files to upload.");
    }
  };

  const handleDeleteClick = (knowledgeBaseId: number) => {
    // Check permission before deleting

    dispatch(deleteKnowledgeBaseThunk(knowledgeBaseId));
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed rounded-lg p-8 text-center">
        <PermissionWrapper componentName="CreateKnowledgeBase">
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          // Temporarily remove the hidden class for testing
          // className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Button variant="outline" className="gap-2" onClick={handleNextClick}>
            <Upload className="w-4 h-4" /> Upload files
          </Button>
        </label>
        </PermissionWrapper>
        {/* <Button className="ml-4 bg-gray-200 hover:bg-gray-300 text-gray-700" onClick={handleNextClick}>
          Next
        </Button> */}
      </div>
    <PermissionWrapper componentName="KnowledgeBase">
      <div>
        <h3 className="font-medium mb-2">Uploaded Files</h3>
        {status === 'loading' && <p className="text-gray-500">Loading...</p>}
        {status === 'failed' && <p className="text-red-500">Error: {error}</p>}
        {status === 'succeeded' && knowledgeBases.length === 0 && (
          <p className="text-gray-500">No files uploaded yet.</p>
        )}
        {status === 'succeeded' && knowledgeBases.length > 0 && (
          <ul>
            {knowledgeBases.map((kb: KnowledgeBase) => (
              <li key={kb.knowledge_base_id} className="flex items-center">
                <PermissionWrapper componentName="DeleteKnowledgeBase">
                <button
                  onClick={() => handleDeleteClick(kb.knowledge_base_id)}
                  className="text-red-500 hover:text-red-700 mr-2"
                  aria-label="Delete knowledge base"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                </PermissionWrapper>
                <ul>
                  {(kb.knowledge_base_sources || []).map((source: KnowledgeBase['knowledge_base_sources'][number]) => (
                    <li key={source.filename}>
                      <a href={source.file_url} className="text-blue-500 hover:underline">
                        {source.filename}
                      </a>
                      <span className="text-gray-500 ml-2">{(Number(source.file_size) / 1024).toFixed(2)} KB</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
      </PermissionWrapper>

      {/* <div>
        <h3 className="font-medium mb-2">Agent Details</h3>
        {agent ? (
          <div>
            <p>ID: {agent.id}</p>
            <p>Name: {agent.name}</p>
            <p>Main Goal: {agent.main_goal}</p>
          </div>
        ) : (
          <p>No agent found.</p>
        )}
      </div> */}
    </div>
  )
}

