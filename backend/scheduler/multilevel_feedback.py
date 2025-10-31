def run(jobs):
    time = 0
    completed = []
    waiting_time = 0
    turnaround_time = 0
    total_burst_time = 0  
    queues = [[] for _ in range(3)]
    quanta = [4, 8, 12]

    jobs = sorted(jobs, key=lambda j: j['arrival'])

    ready = []

    while jobs or any(queues) or ready:
        while jobs and jobs[0]['arrival'] <= time:
            new_job = jobs.pop(0)
            new_job['queue_level'] = 0
            new_job['remaining'] = new_job['burst']
            new_job['timeline'] = []  
            ready.append(new_job)


        for job in ready:
            queues[0].append(job)
        ready.clear()

        current_job = None
        for i in range(3):
            if queues[i]:
                current_job = queues[i].pop(0)
                quantum = quanta[i]
                break

        if not current_job:
            time += 1
            continue

        execution_time = min(current_job['remaining'], quantum)

        start_time = time  
        time += execution_time
        end_time = time    

        current_job['timeline'].append({'start': start_time, 'end': end_time})

        current_job['remaining'] -= execution_time
        total_burst_time += execution_time

        if current_job['remaining'] == 0:
            current_job['waiting'] = (time - current_job['arrival']) - current_job['burst']
            current_job['turnaround'] = time - current_job['arrival']
            current_job['end'] = time
            completed.append(current_job)
            waiting_time += current_job['waiting']
            turnaround_time += current_job['turnaround']
        else:
            if current_job['queue_level'] < 2:
                current_job['queue_level'] += 1
            queues[current_job['queue_level']].append(current_job)

    total_time = time
    throughput = round(len(completed) / total_time, 2) if total_time > 0 else 0
    cpu_utilization = round((total_burst_time / total_time) * 100, 2) if total_time > 0 else 0

    return {
        'algorithm': 'Multilevel Feedback Queue',
        'jobs': completed,
        'avg_waiting': (waiting_time / len(completed)),
        'avg_turnaround': (turnaround_time / len(completed)),
        'throughput': throughput,
        'cpu_utilization': cpu_utilization
    }
