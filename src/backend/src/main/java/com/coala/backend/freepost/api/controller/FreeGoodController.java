package com.coala.backend.freepost.api.controller;

import com.coala.backend.freepost.api.service.FreeGoodServiceImpl;
import com.coala.backend.freepost.db.dto.request.FreeGoodRequestDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@RequestMapping("/api/free/post/")
public class FreeGoodController {
    private final FreeGoodServiceImpl freeGoodService;

    @PostMapping("is/good")
    public ResponseEntity good(@RequestBody @Valid FreeGoodRequestDto freegoodRequestDto) {

        freeGoodService.good(freegoodRequestDto);
        return ResponseEntity.ok()
                .header("200", "성공")
                .build();
    }

    @DeleteMapping("un/good")
    public ResponseEntity unGood(@RequestBody @Valid FreeGoodRequestDto freeGoodRequestDto) {
        freeGoodService.unGood(freeGoodRequestDto);
        return ResponseEntity.ok()
                .header("200", "성공")
                .build();
    }
}
