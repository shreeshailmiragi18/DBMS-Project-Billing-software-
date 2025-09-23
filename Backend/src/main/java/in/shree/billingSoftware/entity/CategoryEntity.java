package in.shree.billingSoftware.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.sql.Timestamp;

@Entity
@Table(name="tbl_category")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor

public class CategoryEntity {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true)
    private String categoryId;
    @Column(unique = true)
    private String name;
    private String description;
    private String bgColor;
    private String imgUrl;
    @CreationTimestamp
    @Column(updatable=false)
    private Timestamp createdAt;
    @CreationTimestamp
    private Timestamp updatedAt;

}
