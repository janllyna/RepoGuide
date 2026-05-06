import os
import shutil
import tempfile
from pathlib import Path
from typing import List, Tuple
import git

# File extensions to process
SUPPORTED_EXTENSIONS = {
    ".py", ".js", ".ts", ".jsx", ".tsx", ".java", ".cpp", ".c",
    ".h", ".cs", ".go", ".rb", ".rs", ".php", ".swift", ".kt",
    ".md", ".txt", ".yml", ".yaml", ".json", ".toml", ".cfg", ".ini",
    ".html", ".css", ".scss"
}

# Directories to skip
SKIP_DIRS = {
    "node_modules", ".git", "__pycache__", ".venv", "venv",
    "dist", "build", ".next", ".nuxt", "target", "vendor",
    ".idea", ".vscode", "coverage", ".pytest_cache"
}

CHUNK_SIZE = 1500
CHUNK_OVERLAP = 200


def clone_and_process_repo(github_url: str) -> Tuple[List[dict], str, int]:
    """
    Clone a GitHub repository and extract text chunks from all code/doc files.
    Returns: (chunks, repo_name, file_count)
    """
    # Create temp directory
    temp_dir = tempfile.mkdtemp(prefix="repoguide_")

    try:
        # Extract repo name from URL
        repo_name = github_url.rstrip("/").split("/")[-1]
        if repo_name.endswith(".git"):
            repo_name = repo_name[:-4]

        repo_path = os.path.join(temp_dir, repo_name)

        # Clone the repository
        print(f"Cloning {github_url} ...")
        git.Repo.clone_from(github_url, repo_path, depth=1)

        # Extract chunks from files
        chunks, file_count = extract_chunks(repo_path)

        return chunks, repo_name, file_count

    except git.exc.GitCommandError as e:
        shutil.rmtree(temp_dir, ignore_errors=True)
        raise ValueError(f"Failed to clone repository: {str(e)}")
    except Exception as e:
        shutil.rmtree(temp_dir, ignore_errors=True)
        raise ValueError(f"Error processing repository: {str(e)}")


def extract_chunks(repo_path: str) -> Tuple[List[dict], int]:
    """Walk through repo files and create overlapping text chunks."""
    all_chunks = []
    file_count = 0

    for root, dirs, files in os.walk(repo_path):
        # Skip unwanted directories in-place
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith(".")]

        for filename in files:
            filepath = os.path.join(root, filename)
            ext = Path(filename).suffix.lower()

            if ext not in SUPPORTED_EXTENSIONS:
                continue

            try:
                with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()

                if not content.strip():
                    continue

                # Relative path for display
                rel_path = os.path.relpath(filepath, repo_path)

                # Split into chunks
                file_chunks = chunk_text(content, rel_path)
                all_chunks.extend(file_chunks)
                file_count += 1

            except Exception:
                continue  # Skip unreadable files

    return all_chunks, file_count


def chunk_text(text: str, source: str) -> List[dict]:
    """Split text into overlapping chunks with metadata."""
    chunks = []

    if len(text) <= CHUNK_SIZE:
        chunks.append({"text": text, "source": source, "chunk_index": 0})
        return chunks

    start = 0
    chunk_index = 0

    while start < len(text):
        end = start + CHUNK_SIZE

        # Try to break at a newline for cleaner chunks
        if end < len(text):
            newline_pos = text.rfind("\n", start, end)
            if newline_pos > start + CHUNK_SIZE // 2:
                end = newline_pos

        chunk_text_content = text[start:end].strip()

        if chunk_text_content:
            chunks.append({
                "text": chunk_text_content,
                "source": source,
                "chunk_index": chunk_index
            })
            chunk_index += 1

        start = end - CHUNK_OVERLAP
        if start >= len(text):
            break

    return chunks

