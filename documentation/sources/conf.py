# Configuration file for the Sphinx documentation builder.
#
# This file only contains a selection of the most common options. For a full
# list see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Path setup --------------------------------------------------------------

# If extensions (or modules to document with autodoc) are in another directory,
# add these directories to sys.path here. If the directory is relative to the
# documentation root, use os.path.abspath to make it absolute, like shown here.
#
# import os
# import sys
# sys.path.insert(0, os.path.abspath('.'))


# -- Project information -----------------------------------------------------

project = "cdk8s-plone"
copyright = "2024-2025, Blue Dynamics Alliance"
author = "Blue Dynamics Alliance Contributors"

# The full version, including alpha/beta/rc tags
# Read version from git tags
import subprocess

try:
    # Get the latest git tag
    result = subprocess.run(
        ["git", "describe", "--tags", "--abbrev=0"],
        capture_output=True,
        text=True,
        check=True,
    )
    release = result.stdout.strip().lstrip("v")  # Remove 'v' prefix if present
except (subprocess.CalledProcessError, FileNotFoundError):
    # Fallback to 0.0.0 if git is not available or no tags exist
    release = "0.0.0"


# -- General configuration ---------------------------------------------------

# Add any Sphinx extension module names here, as strings. They can be
# extensions coming with Sphinx (named 'sphinx.ext.*') or your custom
# ones.
extensions = [
    "myst_parser",
    "sphinxcontrib.mermaid",
    "sphinx_design",  # For grid and card directives
    "sphinx_copybutton",  # Add copy button to code blocks
]

# MySt specific extensions
myst_enable_extensions = [
    "deflist",  # You will be able to utilise definition lists
    "colon_fence",  # Allow ::: fences for directives (needed for grid, cards, etc.)
]

# Treat code fences with these languages as Sphinx directives
myst_fence_as_directive = ["mermaid"]

# Add any paths that contain templates here, relative to this directory.
templates_path = ["_templates"]

# List of patterns, relative to source directory, that match files and
# directories to ignore when looking for source files.
# This pattern also affects html_static_path and html_extra_path.
exclude_patterns = []

# mermaid options
mermaid_output_format = "raw"  # Use client-side rendering with mermaid.js
# -- Options for HTML output -------------------------------------------------

# Base URL for GitHub Pages deployment
# Set to "" for local development, or the full Pages URL for deployment
# This makes absolute paths in logo_target work correctly with path prefix
html_baseurl = "https://bluedynamics.github.io/cdk8s-plone"

# The theme to use for HTML and HTML Help pages.
# Shibuya, matching the rest of the Cloudbrine ecosystem.
html_theme = "shibuya"

html_theme_options = {
    "logo_target": "/cdk8s-plone/",
    "accent_color": "cyan",
    "color_mode": "dark",
    "dark_code": True,
    "nav_links": [
        {
            "title": "Ecosystem",
            "url": "https://bluedynamics.github.io/zodb-pgjsonb/ecosystem.html",
            "children": [
                {
                    "title": "Dashboard",
                    "url": "https://bluedynamics.github.io/zodb-pgjsonb/ecosystem.html",
                    "summary": "Overview of all packages",
                },
                {
                    "title": "zodb-pgjsonb",
                    "url": "https://bluedynamics.github.io/zodb-pgjsonb/",
                    "summary": "PostgreSQL JSONB storage",
                },
                {
                    "title": "zodb-json-codec",
                    "url": "https://bluedynamics.github.io/zodb-json-codec/",
                    "summary": "Rust pickle↔JSON transcoder",
                },
                {
                    "title": "plone-pgcatalog",
                    "url": "https://bluedynamics.github.io/plone-pgcatalog/",
                    "summary": "PostgreSQL-backed catalog",
                },
                {
                    "title": "plone-pgthumbor",
                    "url": "https://bluedynamics.github.io/plone-pgthumbor/",
                    "summary": "Thumbor image scaling",
                },
                {
                    "title": "cdk8s-plone",
                    "url": "https://bluedynamics.github.io/cdk8s-plone/",
                    "summary": "Deploy Plone to Kubernetes",
                },
            ],
        },
        {
            "title": "GitHub",
            "url": "https://github.com/bluedynamics/cdk8s-plone",
        },
        {
            "title": "PyPI",
            "url": "https://pypi.org/project/cdk8s-plone/",
        },
        {
            "title": "npm",
            "url": "https://www.npmjs.com/package/@bluedynamics/cdk8s-plone",
        },
    ],
}

html_logo = "_static/logo.svg"

# Add any paths that contain custom static files (such as style sheets) here,
# relative to this directory.
html_static_path = ["_static"]
