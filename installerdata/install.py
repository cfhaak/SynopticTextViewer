#!/usr/bin/env python3
"""Simple installer script for SynopticTextViewer.

Steps:
1. Download a repository archive from a URL.
2. Unpack it into a temporary directory.
3. Locate the first folder named "installerdata" inside the unpacked repository
   and report its location.

No non-standard Python dependencies are used.

Usage:
    python3 install.py --url https://github.com/cfhaak/SynopticTextViewer/archive/main.zip

If --url is omitted, DEFAULT_REPO_URL (see below) is used. Replace the
placeholder with the real URL of the raw repository archive.
"""

import argparse
import os
import random
import shutil
import sys
import tarfile
import tempfile
import urllib.request
import zipfile

DEFAULT_REPO_URL = "https://github.com/cfhaak/SynopticTextViewer/archive/main.zip"


def download_repo_archive(url: str, destination: str) -> None:
    """Download the repository archive from *url* into *destination*.

    The file is written in binary mode. Raises URLError or OSError on failure.
    """

    with urllib.request.urlopen(url) as response, open(destination, "wb") as out:
        shutil.copyfileobj(response, out)


def unpack_archive(archive_path: str, extract_to: str) -> None:
    """Unpack *archive_path* into directory *extract_to*.

    Tries ZIP first, then TAR formats (any compression). Raises RuntimeError
    if the archive type is not supported or cannot be unpacked.
    """

    os.makedirs(extract_to, exist_ok=True)

    # Try ZIP
    try:
        with zipfile.ZipFile(archive_path) as zf:
            zf.extractall(extract_to)
            return
    except zipfile.BadZipFile:
        pass

    # Try TAR (any compression)
    try:
        with tarfile.open(archive_path, "r:*") as tf:
            tf.extractall(extract_to)
            return
    except tarfile.TarError:
        pass

    raise RuntimeError("Unsupported or invalid archive format: " + archive_path)


def find_installerdata(root: str) -> str | None:
    """Search *root* recursively for a directory named "installerdata".

    Returns the first matching path found, or None if not found.
    """

    for dirpath, dirnames, _ in os.walk(root):
        if "installerdata" in dirnames:
            return os.path.join(dirpath, "installerdata")
    return None


def files_are_identical(path1: str, path2: str, chunk_size: int = 8192) -> bool:
    """Return True if the two files have identical contents, False otherwise."""

    if not (os.path.exists(path1) and os.path.exists(path2)):
        return False

    if os.path.getsize(path1) != os.path.getsize(path2):
        return False

    with open(path1, "rb") as f1, open(path2, "rb") as f2:
        while True:
            b1 = f1.read(chunk_size)
            b2 = f2.read(chunk_size)
            if not b1 and not b2:
                return True
            if b1 != b2:
                return False


def ask_yes_no(prompt: str, default: bool | None = None) -> bool:
    """Ask a yes/no question via input() and return True for yes, False for no.

    *default* controls what happens on empty input:
    - True  -> treat empty input as "yes"
    - False -> treat empty input as "no"
    - None  -> keep asking until user enters y/n explicitly
    """

    if default is True:
        suffix = " [Y/n] "
    elif default is False:
        suffix = " [y/N] "
    else:
        suffix = " [y/n] "

    while True:
        answer = input(prompt + suffix).strip().lower()
        if not answer and default is not None:
            return default
        if answer in {"y", "yes"}:
            return True
        if answer in {"n", "no"}:
            return False
        print("Please answer 'y' or 'n'.")


def _make_updated_target_path(path: str) -> str:
    """Create a new path with a random "_NNNN_updated" suffix before the extension."""

    directory, filename = os.path.split(path)
    stem, ext = os.path.splitext(filename)
    while True:
        rnd = random.randint(1000, 999_999)
        new_name = f"{stem}_{rnd}_updated{ext}"
        candidate = os.path.join(directory, new_name)
        if not os.path.exists(candidate):
            return candidate


def _copy_file_with_conflict_handling(
    src: str,
    dest: str,
    project_root: str,
    src_root: str,
    report: dict,
) -> None:
    """Copy *src* to *dest* with conflict handling and reporting.

        - If *dest* does not exist: copy directly.
        - If *dest* exists and is identical: skip.
        - If *dest* exists and differs: ask the user whether to overwrite.
            If the user agrees, overwrite in place. Otherwise, copy to a new
            name with a random "_NNNN_updated" suffix so nothing is overwritten.
    """

    os.makedirs(os.path.dirname(dest), exist_ok=True)

    dest_rel = os.path.relpath(dest, project_root)
    src_rel = os.path.relpath(src, src_root)

    if not os.path.exists(dest):
        shutil.copy2(src, dest)
        report["new"].append({"src": src_rel, "dest": dest_rel})
        return

    if files_are_identical(src, dest):
        report["unchanged"].append({"src": src_rel, "dest": dest_rel})
        return

    print(
        "Conflict: destination file {dest} already exists and differs from "
        "source {src}.".format(dest=dest_rel, src=src_rel)
    )
    if ask_yes_no("Overwrite existing file?", default=False):
        shutil.copy2(src, dest)
        report["overwritten"].append({"src": src_rel, "dest": dest_rel})
    else:
        existing_rel = dest_rel
        updated_dest = _make_updated_target_path(dest)
        updated_rel = os.path.relpath(updated_dest, project_root)
        shutil.copy2(src, updated_dest)
        report["updated"].append(
            {"src": src_rel, "existing": existing_rel, "dest": updated_rel}
        )


def copy_installerdata_contents(installerdata_path: str, project_root: str) -> dict:
    """Copy relevant files from *installerdata_path* into *project_root*.

    The following mappings are applied:
    - installerdata/css -> html/css
    - installerdata/js/synopticTextViewer -> html/js/synopticTextViewer
    - installerdata/pyscripts -> pyscripts
    - installerdata/xslt -> xslt

    Returns a report dictionary with keys: "new", "updated", "unchanged",
    and "overwritten".
    """

    report: dict[str, list] = {
        "new": [],
        "updated": [],
        "unchanged": [],
        "overwritten": [],
    }

    mappings = [
        (os.path.join(installerdata_path, "css"), os.path.join(project_root, "html", "css")),
        (
            os.path.join(installerdata_path, "js", "synopticTextViewer"),
            os.path.join(project_root, "html", "js", "synopticTextViewer"),
        ),
        (os.path.join(installerdata_path, "pyscripts"), os.path.join(project_root, "pyscripts")),
        (os.path.join(installerdata_path, "xslt"), os.path.join(project_root, "xslt")),
    ]

    for src_base, dest_base in mappings:
        if not os.path.isdir(src_base):
            continue

        for dirpath, _, filenames in os.walk(src_base):
            for filename in filenames:
                src_path = os.path.join(dirpath, filename)
                rel_within_base = os.path.relpath(src_path, src_base)
                dest_path = os.path.join(dest_base, rel_within_base)
                _copy_file_with_conflict_handling(
                    src_path,
                    dest_path,
                    project_root=project_root,
                    src_root=installerdata_path,
                    report=report,
                )

    return report


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Download a SynopticTextViewer repository archive, unpack it "
            "to a temporary directory, and locate the 'installerdata' folder."
        )
    )
    parser.add_argument(
        "--url",
        default=DEFAULT_REPO_URL,
        help=(
            "URL of the repository archive (ZIP or TAR). "
            "If omitted, DEFAULT_REPO_URL inside the script is used."
        ),
    )
    return parser.parse_args(argv)


def cleanup_temp(tmpdir: str, archive_path: str) -> None:
    """Delete the downloaded archive and the temporary directory.

    Any errors during cleanup are ignored to avoid masking the main
    installer outcome.
    """

    # Remove the archive file if it exists.
    if archive_path and os.path.exists(archive_path):
        try:
            os.remove(archive_path)
        except OSError:
            pass

    # Remove the temporary directory and everything inside.
    if tmpdir and os.path.isdir(tmpdir):
        try:
            shutil.rmtree(tmpdir)
        except OSError:
            pass


def main(argv: list[str] | None = None) -> int:
    print(f"Downloading repository archive from {DEFAULT_REPO_URL} ...")

    tmpdir = tempfile.mkdtemp(prefix="synoptic_install_")
    archive_path = os.path.join(tmpdir, "repo_archive")

    try:
        try:
            download_repo_archive(DEFAULT_REPO_URL, archive_path)
        except Exception as exc:
            print(f"Error downloading archive: {exc}", file=sys.stderr)
            return 1

        extract_dir = os.path.join(tmpdir, "repo")
        print("Unpacking repository archive ...")

        try:
            unpack_archive(archive_path, extract_dir)
        except Exception as exc:
            print(f"Error unpacking archive: {exc}", file=sys.stderr)
            return 1

        print("Searching for 'installerdata' folder ...")
        installerdata_path = find_installerdata(extract_dir)

        if not installerdata_path:
            print(
                "Error: 'installerdata' folder not found in the unpacked repository.",
                file=sys.stderr,
            )
            return 1

        print(f"Found 'installerdata' folder at: {installerdata_path}")

        project_root = os.path.abspath(
            os.path.join(os.path.dirname(__file__), os.pardir)
        )
        print("Copying installerdata contents into the current project ...")
        report = copy_installerdata_contents(installerdata_path, project_root)

        if not report["new"] and not report["updated"] and not report["overwritten"]:
            print("No files needed to be copied; everything is already up to date.")
        else:
            if report["new"]:
                print("New files added:")
                for entry in report["new"]:
                    print(f"  - {entry['dest']} (from {entry['src']})")

            if report["overwritten"]:
                print("Files overwritten at user's request:")
                for entry in report["overwritten"]:
                    print(f"  - {entry['dest']} (from {entry['src']})")

            if report["updated"]:
                print(
                    "Files with local changes (avoided overwriting by renaming to *_updated* versions):"
                )
                for entry in report["updated"]:
                    print(
                        "  - New version {dest} (from {src}); "
                        "existing different file at {existing} would have been overwritten.".format(
                            dest=entry["dest"],
                            src=entry["src"],
                            existing=entry["existing"],
                        )
                    )

        return 0
    finally:
        cleanup_temp(tmpdir, archive_path)


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
