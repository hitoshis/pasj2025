document.addEventListener("DOMContentLoaded", () => {
    const table = document.getElementById("program-table");
    const select = document.getElementById("categoryFilter");
    let allData = [];

    fetch("data/abstract.json")
        .then(response => response.json())
        .then(data => {
            allData = data;

            // カテゴリを収集してセレクトボックスに追加
            const categorySet = new Set();
            data.forEach(entry => {
                const cat = entry.category_1 || "施設現状報告";
                categorySet.add(cat);
            });

            Array.from(categorySet)
                .sort((a, b) => {
                    const aKey = (a || "").trim();
                    const bKey = (b || "").trim();

                    if (!aKey) return 1;  // 空白・未分類を後ろへ
                    if (!bKey) return -1;

                    const aNum = aKey.match(/\d+/);
                    const bNum = bKey.match(/\d+/);

                    if (!aNum || !bNum) return aKey.localeCompare(bKey, "ja");

                    return parseInt(aNum[0]) - parseInt(bNum[0]);
                })
                .forEach(cat => {
                    const value = (cat || "").trim();
                    const displayCat = value || "施設現状報告";

                    const opt = document.createElement("option");
                    opt.value = value;
                    opt.textContent = displayCat;
                    select.appendChild(opt);
                });
            renderSummaryTable(allData);
            // 最初に全データ表示
            renderTable("ALL");

            // セレクト変更時に絞り込み
            select.addEventListener("change", () => {
                const selected = select.value;
                renderTable(selected);
            });
        })
        .catch(error => {
            table.innerHTML = "<tr><td colspan='2'>プログラムの取得に失敗しました。</td></tr>";
            console.error("Fetch error:", error);
        });

    function renderTable(categoryFilter) {
        table.innerHTML = ""; // クリア

        allData.forEach(entry => {
            const category = (entry.category_1 || "").trim(); // ← 元の値を使う
            if (categoryFilter !== "ALL" && category !== categoryFilter) return;

            const code = entry.submission_id || "NoCode";
            const title = entry.title_ja || "タイトル未定";
            const authors = entry.coauthors || [];

            const talkRow = document.createElement("tr");

            talkRow.innerHTML = `
              <td valign="top" width="50" nowrap>
                <b>${code}</b><br>
              </td>
              <td valign="top" align="left" width="100%">
                <b>${title}</b><br>
                ${renderAuthorsWithSuperscript(authors)}
              </td>
            `;

            table.appendChild(talkRow);
        });
    }

    function renderSummaryTable(data) {
        const table = document.getElementById("summary-table").querySelector("tbody");
        table.innerHTML = ""; // クリア

        const categoryCount = new Map();
        let total = 0;

        data.forEach(entry => {
            const cat = entry.category_1 || "施設現状報告";
            categoryCount.set(cat, (categoryCount.get(cat) || 0) + 1);
            total++;
        });

        // 総数行（最初に表示）
        const totalRow = document.createElement("tr");
        totalRow.innerHTML = `<td><b>総件数</b></td><td><b>${total}</b></td>`;
        table.appendChild(totalRow);

        // 各カテゴリ
        Array.from(categoryCount.entries())
            .sort((a, b) => {
                const aKey = (a[0] || "").trim();
                const bKey = (b[0] || "").trim();

                if (!aKey) return 1;  // aが未分類なら後ろに
                if (!bKey) return -1; // bが未分類なら後ろに

                const aMatch = aKey.match(/\d+/);
                const bMatch = bKey.match(/\d+/);

                if (!aMatch || !bMatch) return aKey.localeCompare(bKey, "ja");

                return parseInt(aMatch[0]) - parseInt(bMatch[0]);
            })
            .forEach(([cat, count]) => {
                const displayCat = (cat || "").trim() || "施設現状報告";
                const row = document.createElement("tr");
                row.innerHTML = `<td>${displayCat}</td><td>${count}</td>`;
                table.appendChild(row);
            });
    }


    function renderAuthorsWithSuperscript(authors) {
        const affiliationMap = new Map();  // 所属 → 添え字
        let affCounter = 1;

        const authorsHtml = authors.map(a => {
            if (!a.last_name || !a.first_name) return "";

            const mark = a.role && a.role.includes("登壇") ? "○" : "";
            const name = a.last_name + " " + a.first_name;
            const aff = (a.affiliation || "").trim();

            let affIndex = "";
            if (aff) {
                if (!affiliationMap.has(aff)) {
                    affiliationMap.set(aff, affCounter++);
                }
                affIndex = `<sup>${affiliationMap.get(aff)}</sup>`;
            }

            return `${mark}${name}${affIndex}`;
        }).filter(s => s).join(", ");

        const affHtml = Array.from(affiliationMap.entries())
            .map(([aff, idx]) => `<sup>${idx}</sup>${aff}`)
            .join(", ");

        return authorsHtml + "<br>" + affHtml + "<br>";
    }
});

function toggleAbstract(id) {
    const elem = document.getElementById(id);
    if (elem.style.display === "none") {
        elem.style.display = "block";
    } else {
        elem.style.display = "none";
    }
}
