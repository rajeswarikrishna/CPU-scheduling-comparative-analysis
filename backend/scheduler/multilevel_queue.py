def run(jobs):
    time = 0
    completed = []
    waiting_time = 0
    turnaround_time = 0
    total_burst_time = 0
    system_queue = [job.copy() for job in jobs if job['priority'] <= 3]
    user_queue = [job.copy() for job in jobs if job['priority'] > 3]

    system_queue.sort(key=lambda x: x['arrival'])
    user_queue.sort(key=lambda x: x['arrival'])

    system_waiting = []
    user_waiting = []

    while system_queue or user_queue or system_waiting or user_waiting:
 
        system_waiting += [j for j in system_queue if j['arrival'] <= time]
        system_queue = [j for j in system_queue if j['arrival'] > time]

        user_waiting += [j for j in user_queue if j['arrival'] <= time]
        user_queue = [j for j in user_queue if j['arrival'] > time]

        if system_waiting:
          
            job = system_waiting.pop(0)

            if time < job['arrival']:
                time = job['arrival']

            job['start'] = time
            job['waiting'] = time - job['arrival']
            time += job['burst']
            job['end'] = time
            job['turnaround'] = job['end'] - job['arrival']

            total_burst_time += job['burst']
            waiting_time += job['waiting']
            turnaround_time += job['turnaround']
            completed.append(job)

        elif user_waiting:
           
            job = user_waiting.pop(0)

            if time < job['arrival']:
                time = job['arrival']

            job['start'] = time
            job['waiting'] = time - job['arrival']
            time += job['burst']
            job['end'] = time
            job['turnaround'] = job['end'] - job['arrival']

            total_burst_time += job['burst']
            waiting_time += job['waiting']
            turnaround_time += job['turnaround']
            completed.append(job)

        else:
          
            time += 1

    total_time = time
    throughput = round(len(completed) / total_time, 2) if total_time else 0
    cpu_utilization = round((total_burst_time / total_time) * 100, 2) if total_time else 0

    return {
        'algorithm': 'Multilevel Queue (Non-Preemptive)',
        'jobs': completed,
        'avg_waiting': round(waiting_time / len(completed), 2),
        'avg_turnaround': round(turnaround_time / len(completed), 2),
        'throughput': throughput,
        'cpu_utilization': cpu_utilization
    }