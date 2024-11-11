import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../src/firebase'; // Import the auth instance

const Climate = () => {
  const [files, setFiles] = useState([]);
  const [analysisResult, setAnalysisResult] = useState('');
  const [filePreviews, setFilePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysisType, setAnalysisType] = useState('images');
  const [promptType, setPromptType] = useState('vegetation');
  const [subPromptType, setSubPromptType] = useState('AER AI');
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login'); // Redirect to login page if not authenticated
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!user) {
    return <p>...</p>; // Show a loading state until user is authenticated
  }

  const handleUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    setFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);

    const previews = uploadedFiles.map((file) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      return new Promise((resolve) => {
        reader.onloadend = () => {
          resolve({ type: file.type, data: reader.result });
        };
      });
    });

    Promise.all(previews).then((previews) => {
      setFilePreviews((prevPreviews) => [...prevPreviews, ...previews]);
    });
  };

  const handleRemoveImage = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setFilePreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    try {
      setLoading(true);
      const response = await axios.post('/api/gemini', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'analysis-type': promptType,
          'sub-prompt-type': subPromptType,
        },
      });
      console.log('Analysis response:', response);
      setAnalysisResult(response.data);
    } catch (error) {
      console.error('Error analyzing files:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (preview) => {
    setSelectedPreview(preview);
  };

  const closeModal = () => {
    setSelectedPreview(null);
  };

  return (
    <div className="container" style={{ marginTop: '20px' , maxWidth: '1200px', width: '90%'}}>
      <h1 style={{fontFamily: 'Montserrat, sans-serif',          fontWeight: '550',           fontSize: '40px', 

color: 'green' ,               marginBottom: '25px'
}}>
  Satellite Imagery timelapse Analysis</h1>


      <p style={{fontFamily: 'Montserrat, sans-serif',                     fontFamily: 'Montserrat, sans-serif', 
    fontSize: '18px', 
    fontWeight: '550', 
    color: '#2E8B57', // Medium grey color for the paragraph
    lineHeight: '1.4', 
    marginTop: '10px',
             marginBottom: '10px',
}}>
  For satellite imagery timelapse, refer to{' '}  
  <a 
    href="https://apps.sentinel-hub.com/eo-browser" 
    target="_blank" 
    rel="noopener noreferrer" 
    style={{ color: '#1a73e8', textDecoration: 'underline' }}  // Customize the color and style here
  >
 https://apps.sentinel-hub.com/eo-browser  </a>
 {' '}or any other satellite imagery provider you would like.
</p>



      <div>
        <label>
          <input
            type="radio"
            value="images"
            checked={analysisType === 'images'}
            onChange={() => setAnalysisType('images')}
          />
           Images : jpg , jpeg
        </label>
        <label>
          <input
            type="radio"
            value="video"
            checked={analysisType === 'video'}
            onChange={() => setAnalysisType('video')}
          />
           Video : mp4
        </label>
      </div>
      <div>
        <label htmlFor="promptType">Select Analysis Type:</label>
        <select
          id="promptType"
          value={promptType}
          onChange={(e) => setPromptType(e.target.value)}
        >
          <option value="vegetation">Vegetation and Forestry</option>
          <option value="water">Ocean and Water Bodies</option>
          <option value="agriculture">Agriculture</option>
          <option value="geology">Geology</option>
          <option value="urban">Urban Areas</option>
          <option value="volcanoes">Volcanoes</option>
          <option value="snow">Snow and Glaciers</option>
          <option value="atmosphere">Atmosphere and Air Pollution</option>
        </select>
      </div>
      {promptType === 'atmosphere' && (
        <div>
          <label htmlFor="subPromptType"></label>
          <select
            id="subPromptType"
            value={subPromptType}
            onChange={(e) => setSubPromptType(e.target.value)}
          >
            <option value="AER ">AER AI (Aerosol Index)</option>
            <option value="CH4">CH4 (Methane)</option>
            <option value="CO">CO (Carbon monoxide)</option>
            <option value="cloud "> Cloud Base</option>
            <option value="HCHO">HCHO (Formaldehyde)</option>
            <option value="NO2">NO2 (Nitrogen dioxide)</option>
            <option value="O3">O3 (Ozone)</option>
            <option value="SO2">SO2 (Sulfur dioxide)</option>
          </select>
        </div>
      )}
      <input
        type="file"
        accept={analysisType === 'images' ? '.jpg, .jpeg' : 'video/*'}
        multiple
        onChange={handleUpload}
        style={{ display: 'none' }}
        id="file-upload"
      />
      <div className="file-previews">
        {filePreviews.map((preview, index) => (
          <div key={index} className="preview-container">
            {preview.type.startsWith('image/') ? (
              <img
                src={preview.data}
                alt={`Uploaded File Preview ${index + 1}`}
                className="file-preview"
                onClick={() => openModal(preview)} // Open modal on click
              />
            ) : (
              <video
                controls
                className="file-preview"
                onClick={() => openModal(preview)} // Open modal on click
              >
                <source src={preview.data} type={preview.type} />
                Your browser does not support the video tag.
              </video>
            )}
            <button className="remove-button" onClick={() => handleRemoveImage(index)}>x</button>
          </div>
        ))}
        <div className="add-more">
          <label htmlFor="file-upload" className="add-more-label">
            +
          </label>
        </div>
      </div>
      <button onClick={handleAnalyze} disabled={!files.length || loading}>
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>
      <div className="result">
        {analysisResult && (
          <div>
            <h2>Analysis Result</h2>
            <p>{analysisResult}</p>
          </div>
        )}
      </div>
      
      {selectedPreview && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {selectedPreview.type.startsWith('image/') ? (
              <img src={selectedPreview.data} alt="Full Preview" className="full-preview" />
            ) : (
              <video controls className="full-preview">
                <source src={selectedPreview.data} type={selectedPreview.type} />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      )}

<style jsx>{`
        .container {
          background-color: #e6f4ea; /* Soft green background */
          padding: 30px;
          border-radius: 12px;
          color: #3e4b3d; /* Dark green text */
          max-width: 700px;
          margin: 0 auto;
          font-family: 'Arial', sans-serif;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #2e7d32; /* Deep green */
          margin-bottom: 20px;
          font-size: 24px;
        }
        label {
          display: block;
          margin-bottom: 10px;
          color: #5d4037; /* Brown */
          font-weight: bold;
        }
        .file-previews {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-top: 20px;
          justify-content: center;
          align-items: center;
        }
        .preview-container {
          position: relative;
        }
        .file-preview {
          width: 110px; /* Small previews */
          height: 110px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid #3e4b3d;
          cursor: pointer;
        }
        video.file-preview {
          width: 150px;
          height: auto;
        }
        .remove-button {
          position: absolute;
          top: -5px;
          right: -5px;
          background-color: #ff5252; /* Red */
          color: white;
          border: none;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          cursor: pointer;
        }
        .add-more {
          width: 110px;
          height: 110px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px dashed #3e4b3d;
          border-radius: 8px;
          cursor: pointer;
        }
        .add-more-label {
          font-size: 36px;
          color: #3e4b3d;
          cursor: pointer;
        }
        button {
          background-color: #558b2f; /* Earthy green */
          color: white;
          padding: 12px 25px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 20px;
          font-size: 16px;
          transition: background-color 0.3s ease;
        }
        button:hover {
          background-color: #33691e; /* Darker green on hover */
        }
        button:disabled {
          background-color: #c5e1a5;
          cursor: not-allowed;
        }
        .result {
          margin-top: 30px;
          background-color: #fff3e0; /* Light brown background */
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .result h2 {
          margin-top: 0;
          color: #3e2723; /* Dark brown */
          font-size: 20px;
        }
        .result p {
          white-space: pre-wrap; /* Maintain line breaks */
          font-size: 16px;
        }
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-content {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          max-width: 90%;
          max-height: 90%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .full-preview {
          max-width: 100%;
          max-height: 100%;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default Climate;
