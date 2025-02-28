import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchKnowledgeBases, uploadFilesThunk } from "@/store/knowledgeBaseSlice"
import { fetchAgentById } from '@/store/agentSlice'
import { RootState } from '@/store/store'
import { AppDispatch } from '@/store/store'


interface KnowledgeBaseProps {
    formData: {
      id: number
     
      personality: string
     
    }
    updateFormData: (data: Partial<KnowledgeBaseProps["formData"]>) => void
  }
  

export function KnowledgeBase({ formData, updateFormData }: KnowledgeBaseProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { knowledgeBases, status, error } = useSelector((state: RootState) => state.knowledgeBase)
  const agent = useSelector((state: RootState) => state.agent.selectedAgent)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    dispatch(fetchKnowledgeBases(formData.id)) // Replace with actual agent ID
    dispatch(fetchAgentById(formData.id)) // Replace with actual agent ID
  }, [dispatch])

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
    if (selectedFiles.length > 0) {
      dispatch(uploadFilesThunk({ agentId: formData.id, files: selectedFiles }));
    } else {
      alert("Please select files to upload.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed rounded-lg p-8 text-center">
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
        {/* <Button className="ml-4 bg-gray-200 hover:bg-gray-300 text-gray-700" onClick={handleNextClick}>
          Next
        </Button> */}
      </div>

      <div>
        <h3 className="font-medium mb-2">Uploaded Files</h3>
        {status === 'loading' && <p className="text-gray-500">Loading...</p>}
        {status === 'failed' && <p className="text-red-500">Error: {error}</p>}
        {status === 'succeeded' && knowledgeBases.length === 0 && (
          <p className="text-gray-500">No files uploaded yet.</p>
        )}
        {status === 'succeeded' && knowledgeBases.length > 0 && (
          <ul>
            {knowledgeBases.map((kb: any) => (
              <li key={kb.knowledge_base_id}>
                {/* <h4 className="font-medium">{kb.knowledge_base_id}</h4> */}
                <ul>
                  {(kb.knowledge_base_sources || []).map((source: any) => (
                    <li key={source.filename}>
                      <a href={source.file_url} className="text-blue-500 hover:underline">
                        {source.filename}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>

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

