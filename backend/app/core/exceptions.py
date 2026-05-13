class ResumeAnalyzerError(Exception):
    """Base domain exception for analyzer-related failures."""


class InvalidFileError(ResumeAnalyzerError):
    """Raised when an unsupported file is uploaded."""


class MissingJobDescriptionError(ResumeAnalyzerError):
    """Raised when neither JD text nor JD file is provided."""

