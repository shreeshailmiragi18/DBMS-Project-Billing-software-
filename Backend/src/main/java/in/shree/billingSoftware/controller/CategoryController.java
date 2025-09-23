package in.shree.billingSoftware.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.shree.billingSoftware.io.CategoryRequest;
import in.shree.billingSoftware.io.CategoryResponse;
import in.shree.billingSoftware.service.CategoryService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CategoryController{
    private final CategoryService categoryService;

    @PostMapping("/admin/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponse addCategory(@RequestPart("category") String categoryString,
                                        @RequestPart("file") MultipartFile file) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        CategoryRequest request =null;
        try{
            request= objectMapper.readValue(categoryString,CategoryRequest.class);
            return categoryService.add(request,file);
        } catch (JsonProcessingException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"exception occured while parsing the JSON: "+ex.getMessage());
        }

    }
    @GetMapping("/categories")
    public List<CategoryResponse> fetchCategories(){
        return categoryService.read();
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/admin/categories/{categoryId}")
    public void remove(@PathVariable String categoryId){
        try{
            categoryService.delete(categoryId);
        }catch(Exception e){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,e.getMessage());
        }
    }

}
