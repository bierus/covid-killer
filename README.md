# covid-killer


# Setup backend server

Before starting the server, ensure you're working on the Python 3.8.2. Upgrade pip and setuptools:
```
$ pip install --upgrade pip
$ pip install --upgrade setuptools
```
Then install poetry:
```
$ curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python
```
then install the latest PostgreSQL version from https://www.postgresql.org/download/.
Go to the `api` directory and install dependencies with `poetry install --no-root`.
