from collections import defaultdict

def run(jobs):
    time = 0
    completed = []
    user_cpu_time = defaultdict(int)
    waiting_time = 0
    turnaround_time = 0
    total_burst_time = 0 
    initial_time = None

    jobs = sorted(jobs, key=lambda j: j['arrival'])

    if jobs:
        initial_time = jobs[0]['arrival']

    while jobs:
        ready = [j for j in jobs if j['arrival'] <= time]
        if not ready:
            time += 1
            continue

        user_min = min(ready, key=lambda j: user_cpu_time[j['user']])

        user_jobs = [j for j in ready if j['user'] == user_min['user']]
        job = min(user_jobs, key=lambda j: j['arrival'])

        job['start'] = time
        job['waiting'] = time - job['arrival']
        job['turnaround'] = job['waiting'] + job['burst']
        job['end'] = time + job['burst']

        time += job['burst']
        user_cpu_time[job['user']] += job['burst']

        waiting_time += job['waiting']
        turnaround_time += job['turnaround']
        total_burst_time += job['burst']

        completed.append(job)
        jobs.remove(job)

    total_time = time - initial_time if initial_time is not None else time
    throughput = round(len(completed) / total_time, 2) if total_time > 0 else 0
    cpu_utilization = round((total_burst_time / total_time) * 100, 2) if total_time > 0 else 0

    return {
        'algorithm': 'Fair Share Scheduling',
        'jobs': completed,
        'avg_waiting': round(waiting_time / len(completed), 2),
        'avg_turnaround': round(turnaround_time / len(completed), 2),
        'throughput': throughput,
        'cpu_utilization': cpu_utilization
    }
