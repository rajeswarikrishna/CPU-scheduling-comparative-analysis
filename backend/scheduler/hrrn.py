def run(jobs):
    time = 0
    completed = []
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

        for j in ready:
            j['response_ratio'] = ((time - j['arrival']) + j['burst']) / j['burst']

        job = max(ready, key=lambda j: j['response_ratio'])

        job['start'] = time
        job['waiting'] = time - job['arrival']
        job['turnaround'] = job['waiting'] + job['burst']
        job['end'] = time + job['burst']

        waiting_time += job['waiting']
        turnaround_time += job['turnaround']
        total_burst_time += job['burst']

        time += job['burst']
        completed.append(job)
        jobs.remove(job)

    total_time = time - initial_time if initial_time is not None else time
    throughput = round(len(completed) / total_time, 2) if total_time > 0 else 0
    cpu_utilization = round((total_burst_time / total_time) * 100, 2) if total_time > 0 else 0

    return {
        'algorithm': 'HRRN',
        'jobs': completed,
        'avg_waiting': round(waiting_time / len(completed), 2),
        'avg_turnaround': round(turnaround_time / len(completed), 2),
        'throughput': throughput,
        'cpu_utilization': cpu_utilization
    }
