# KingSocial - Integrated Digital Ecosystem

KingSocial is a component-based, AI-driven platform for university communities. This repository uses a **Turborepo** monorepo structure to manage the frontend, backend, and shared packages.

---

## 📋 Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v18.x or higher)
- **pnpm** (Highly recommended for this monorepo)
- **MongoDB Atlas Account** (with Vector Search enabled)
- **Hugging Face Account** (for AI embeddings)
- **Cloudinary Account** (for image hosting)

---

## 🛠️ Local Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/PabloRius/kingsocial-monorepo
cd kingsocial-monorepo
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

You must the following .env files in the specific components:

#### packages/database/prisma/.env

```bash
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/KingSocial?retryWrites=true&w=majority"
```

#### apps/web/.env

```bash
NEXT_PUBLIC_MARKETPLACE_URL="http://localhost:3001"
NEXT_PUBLIC_PROFILE_URL="http://localhost:3002"
NEXT_PUBLIC_COMMUNITIES_URL="http://localhost:3003"
NEXT_PUBLIC_CHAT_URL="http://localhost:4000"

CLOUDINARY_CLOUD_NAME=<cloudinary_cloud_name>
CLOUDINARY_API_KEY=<cloudinary_api_key>
CLOUDINARY_API_SECRET=<cloudinary_api_secret>

AUTH_SECRET=<generated_secret>
AUTH_URL=http://localhost:3000

AUTH_MICROSOFT_ENTRA_ID_ID=<microsoft_entra_id_id>
AUTH_MICROSOFT_ENTRA_ID_SECRET=<microsoft_entra_id_secret>
AUTH_MICROSOFT_ENTRA_ID_ISSUER=<microsoft_entra_id_issuer>

AUTH_GOOGLE_ID=<google_auth_id>
AUTH_GOOGLE_SECRET=<google_auth_secret>
```

#### apps/profile_management/.env

```bash
HF_TOKEN=<hugging_face_inference_api_token>
```

### 4. Database Initialization

Generate the Prisma client and push the schema to your MongoDB instance:

```bash
pnpm turbo run db:generate
```

## 🚀 Running the Application

To run all applications (Frontend, Backend, and Socket server) simultaneously:

```bash
pnpm dev
```

Frontend: http://localhost:3000

## 🧩 External Services Configuration

### 1. MongoDB Atlas Vector Search

1. Log in to MongoDB Atlas.
2. Navigate to Atlas Search and create a Vector Search Index.
3. Use the following JSON configuration for the index:

```JSON
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 384,
      "similarity": "cosine"
    }
  ]
}
```

### 2. Cloudinary

Ensure your Cloudinary upload preset is set to "unsigned" if you are using client-side uploads, or configure "signed" uploads via the backend utils package.

### 3. Hugging Face

The application uses the all-MiniLM-L6-v2 model. Ensure your API token has "Inference API" permissions.

---

## ✒️ Creator

- **Author:** [Pablo García Rius](https://github.com/PabloRius) (K2461672)
- **Degree:** MSc Software Engineering with Management Studies
- **Supervisor:** Jamshid Dehmeshki
- **Institution:** Kingston University London

---
