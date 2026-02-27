package com.readpdfs.bff.api;

import com.readpdfs.contract.task.TaskProgressEvent;
import java.time.Duration;
import java.time.Instant;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/v1/tasks")
public class TaskEventsController {

  @GetMapping(value = "/{taskId}/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  public Flux<ServerSentEvent<TaskProgressEvent>> streamTaskEvents(@PathVariable String taskId) {
    return Flux.interval(Duration.ofSeconds(2))
        .map(
            seq -> {
              var progress = (int) Math.min(100, seq * 20);
              var status = progress >= 100 ? "DONE" : "RUNNING";
              var event = new TaskProgressEvent(taskId, status, progress, "Task skeleton heartbeat", Instant.now());
              return ServerSentEvent.<TaskProgressEvent>builder()
                  .id(taskId + "-" + seq)
                  .event("TASK_PROGRESS")
                  .data(event)
                  .build();
            });
  }
}
