from logging.config import fileConfig
# Add these imports at the top of the file
import sys
from pathlib import Path

# Add the app directory to the Python path
sys.path.append(str(Path(__file__).parent.parent))

# Import your models and Base
from app.db.models import Base
from app.core.config import settings
from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)


# Update the config section to use your database URL
config = context.config
config.set_main_option("sqlalchemy.url", settings.DATABASE_URI)

# Update the target_metadata with your Base.metadata
target_metadata = Base.metadata