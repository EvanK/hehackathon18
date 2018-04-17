#!/usr/bin/env python

from itertools import product
from json import dumps, loads
from os import makedirs, remove
from pprint import pprint
from re import finditer
from subprocess import check_output
from termcolor import colored

choices = {
    'DATABASE_TZ': ['', 'America/Chicago', 'America/Los_Angeles'],
    'NODEJS_TZ': ['', 'America/Chicago', 'America/Los_Angeles'],
    'SESSION_TZ': ['', 'db', 'js'],
    'ENV_TZ_OVERRIDE': ['', 'America/Chicago', 'America/Los_Angeles'],
}

combos = [dict(zip(choices, v)) for v in product(*choices.values())]

print colored('From %s variables, got %s combinations...' % (len(choices), len(combos)), 'yellow', attrs=['bold'])

iteration = 1

try:
    makedirs('./metrics')
except OSError as e:
    pass

for element in combos:
    print colored('Iteration %s...' % iteration, 'red', attrs=['bold'])

    dotenv = open('./.env', 'w')
    for key in element:
        dotenv.write('%s="%s"\n' % (key, element[key]))
    dotenv.close()

    output = check_output(["./run.sh"], universal_newlines=True)
    print output

    matches = {}
    for match in finditer(r"<<(?P<label>[^>]+)>>[ ]+(?P<json>[^\n]+)", output, flags=0):
        matches[match.group('label')] = loads(match.group('json'))

    data = open('./metrics/%s.json' % iteration, 'w')
    data.write('%s\n' % dumps(matches))
    data.close()

    iteration += 1

remove('./.env')
print colored('We finished!', 'red', 'on_yellow', attrs=['bold'])
