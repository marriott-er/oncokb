package org.mskcc.cbio.oncokb.model;
// Generated Dec 19, 2013 1:33:26 AM by Hibernate Tools 3.2.1.GA

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.text.WordUtils;
import org.mskcc.cbio.oncokb.util.AlterationUtils;
import org.mskcc.cbio.oncokb.util.GeneUtils;
import org.mskcc.cbio.oncokb.util.QueryUtils;

import java.util.ArrayList;
import java.util.List;


/**
 * TumorType generated by hbm2java
 */
public class Query implements java.io.Serializable {
    private String id; //Optional, This id is passed from request. The identifier used to distinguish the query
    private String type; // Query type. Different type may return different result.
    private String hugoSymbol;
    private Integer entrezGeneId;
    private String alteration;
    private String alterationType;
    private StructuralVariantType svType;
    private String tumorType;
    private String consequence;
    private Integer proteinStart;
    private Integer proteinEnd;
    private String hgvs;

    public Query() {
    }

    public Query(Alteration alt) {
        if (alt != null) {
            if (alt.getGene() != null) {
                this.hugoSymbol = alt.getGene().getHugoSymbol();
                this.entrezGeneId = alt.getGene().getEntrezGeneId();
            }
            setAlteration(alt.getAlteration());
            this.alterationType = alt.getAlterationType() == null ? "MUTATION" : alt.getAlterationType().name();
            this.consequence = alt.getConsequence() == null ? null : alt.getConsequence().getTerm();
            this.proteinStart = alt.getProteinStart();
            this.proteinEnd = alt.getProteinEnd();
        }
    }

    public Query(VariantQuery variantQuery) {
        if (variantQuery != null) {
            if (variantQuery.getGene() != null) {
                this.hugoSymbol = variantQuery.getGene().getHugoSymbol();
                this.entrezGeneId = variantQuery.getGene().getEntrezGeneId();
            }
            setAlteration(variantQuery.getQueryAlteration());
            this.setTumorType(variantQuery.getQueryTumorType());
            this.consequence = variantQuery.getConsequence();
            this.proteinStart = variantQuery.getProteinStart();
            this.proteinEnd = variantQuery.getProteinEnd();
        }
    }

    public Query(String hugoSymbol, String alteration, String tumorType) {
        this.hugoSymbol = hugoSymbol;
        this.setAlteration(alteration);
        this.setTumorType(tumorType);
    }

    public Query(String id, String type, Integer entrezGeneId, String hugoSymbol,
                 String alteration, String alterationType, StructuralVariantType svType,
                 String tumorType, String consequence, Integer proteinStart, Integer proteinEnd, String hgvs) {
        this.id = id;
        this.type = type;
        if (hugoSymbol != null && !hugoSymbol.isEmpty()) {
            this.hugoSymbol = hugoSymbol;
        }
        this.entrezGeneId = entrezGeneId;
        this.setAlteration(alteration);
        this.alterationType = alterationType;
        this.svType = svType;
        this.setTumorType(tumorType);
        this.consequence = consequence;
        this.proteinStart = proteinStart;
        this.proteinEnd = proteinEnd;
        this.setHgvs(hgvs);
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getHugoSymbol() {
        return hugoSymbol;
    }

    public void setHugoSymbol(String hugoSymbol) {
        this.hugoSymbol = hugoSymbol;
    }

    public Integer getEntrezGeneId() {
        return entrezGeneId;
    }

    public void setEntrezGeneId(Integer entrezGeneId) {
        this.entrezGeneId = entrezGeneId;
    }

    public String getAlteration() {
        return alteration;
    }

    public void setAlteration(String alteration) {
        if (alteration != null) {
            alteration = alteration.replace("p.", "");
        }
        this.alteration = alteration;
    }

    public String getAlterationType() {
        return alterationType;
    }

    public void setAlterationType(String alterationType) {
        this.alterationType = alterationType;
    }

    public StructuralVariantType getSvType() {
        return svType;
    }

    public void setSvType(StructuralVariantType svType) {
        this.svType = svType;
    }

    public String getTumorType() {
        return tumorType;
    }

    public void setTumorType(String tumorType) {
        if (tumorType != null) {
            tumorType = tumorType.trim();
        }
        this.tumorType = tumorType;
    }

    public String getConsequence() {
        return consequence;
    }

    public void setConsequence(String consequence) {
        this.consequence = consequence;
    }

    public Integer getProteinStart() {
        return proteinStart;
    }

    public void setProteinStart(Integer proteinStart) {
        this.proteinStart = proteinStart;
    }

    public Integer getProteinEnd() {
        return proteinEnd;
    }

    public void setProteinEnd(Integer proteinEnd) {
        this.proteinEnd = proteinEnd;
    }

    public String getHgvs() {
        return hgvs;
    }

    public void setHgvs(String hgvs) {
        this.hgvs = hgvs;
        if (hgvs != null && !hgvs.trim().isEmpty()) {
            Alteration alteration = AlterationUtils.getAlterationByHGVS(hgvs);
            if (alteration != null) {
                if (alteration.getGene() != null) {
                    this.hugoSymbol = alteration.getGene().getHugoSymbol();
                    this.entrezGeneId = alteration.getGene().getEntrezGeneId();
                }
                this.alterationType = null;
                this.setAlteration(alteration.getAlteration());
                this.proteinStart = alteration.getProteinStart();
                this.proteinEnd = alteration.getProteinEnd();
                if (alteration.getConsequence() != null)
                    this.consequence = alteration.getConsequence().getTerm();
            }
        }
    }

    public void enrich() {
        if (this.getEntrezGeneId() == null && this.getHugoSymbol() == null
            && this.getAlteration() != null && !this.getAlteration().isEmpty()) {
            this.setEntrezGeneId(-2);
        }

        // For structural variant, if the entrezGeneId is specified which means this is probably a intragenic event. In this case, the hugoSymbol should be ignore.
        if(this.getAlterationType() != null) {
            AlterationType alterationType = AlterationType.getByName(this.getAlterationType());
            if ((alterationType.equals(AlterationType.FUSION) ||
                alterationType.equals(AlterationType.STRUCTURAL_VARIANT)) &&
                this.getEntrezGeneId() != null) {
                Gene entrezGeneIdGene = GeneUtils.getGeneByEntrezId(this.getEntrezGeneId());
                this.setHugoSymbol(entrezGeneIdGene.getHugoSymbol());
            }
        }

        // Set the alteration to empty string in order to get relevant variants.
        if (this.getAlteration() == null) {
            this.setAlteration("");
        }

        this.setAlteration(QueryUtils.getAlterationName(this));
    }

    @JsonIgnore
    public String getQueryId() {

        List<String> content = new ArrayList<>();
        if (this.entrezGeneId != null) {
            content.add(Integer.toString(this.entrezGeneId));
        } else {
            if (this.hugoSymbol != null) {
                content.add(this.hugoSymbol);
            } else {
                content.add("");
            }
        }
        if (this.alteration != null) {
            content.add(this.alteration);
        } else {
            content.add("");
        }
        if (this.alterationType != null) {
            content.add(this.alterationType);
        } else {
            content.add("");
        }
        if (this.svType != null) {
            content.add(this.svType.name());
        } else {
            content.add("");
        }
        if (this.type != null) {
            content.add(this.type);
        } else {
            content.add("");
        }
        if (this.tumorType != null) {
            content.add(this.tumorType);
        } else {
            content.add("");
        }
        if (consequence != null) {
            content.add(this.consequence);
        } else {
            content.add("");
        }
        if (this.proteinStart != null) {
            content.add(Integer.toString(this.proteinStart));
        } else {
            content.add("");
        }

        if (this.proteinEnd != null) {
            content.add(Integer.toString(this.proteinEnd));
        } else {
            content.add("");
        }

        if (this.hgvs != null) {
            content.add(this.hgvs);
        } else {
            content.add("");
        }

        return StringUtils.join(content.toArray(), "&");
    }
}


